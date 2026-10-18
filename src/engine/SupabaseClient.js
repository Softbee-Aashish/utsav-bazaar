// High-Performance Supabase Cloud REST Client
// Provides zero-dependency REST integration with Supabase PostgreSQL

const SUPABASE_CONFIG = {
  url: 'https://cmwadgnvtrwzqbbpnjlg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtd2FkZ252dHJ3enFiYnBuamxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMTk4ODksImV4cCI6MjEwNzg5NTg4OX0.UoyjUq31_GhuW0sfpISfy3Cu7GZWv6vwLpPECDBBuKI'
};

export class SupabaseClient {
  constructor(config = SUPABASE_CONFIG) {
    this.url = config.url.replace(/\/+$/, '');
    this.anonKey = config.anonKey;
    this.restUrl = `${this.url}/rest/v1`;
    this.isConnected = false;
    this.lastChecked = null;
  }

  getHeaders(extra = {}) {
    return {
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  // Health check
  async checkConnection() {
    try {
      const res = await fetch(`${this.restUrl}/products?select=id&limit=1`, {
        method: 'GET',
        headers: this.getHeaders(),
        cache: 'no-store'
      });
      this.isConnected = res.ok;
      this.lastChecked = new Date();
      return { ok: res.ok, status: res.status };
    } catch (err) {
      this.isConnected = false;
      this.lastChecked = new Date();
      return { ok: false, error: err.message };
    }
  }

  // PRODUCTS API
  async fetchProducts() {
    const res = await fetch(`${this.restUrl}/products?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch products from Supabase: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data.map(this.mapProductFromDb);
  }

  async insertProduct(product) {
    const dbPayload = this.mapProductToDb(product);
    const res = await fetch(`${this.restUrl}/products`, {
      method: 'POST',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(dbPayload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to insert product in Supabase: ${res.status} ${errText}`);
    }
    const inserted = await res.json();
    return this.mapProductFromDb(inserted[0] || dbPayload);
  }

  async updateProduct(id, product) {
    const dbPayload = this.mapProductToDb(product);
    delete dbPayload.id;

    const res = await fetch(`${this.restUrl}/products?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(dbPayload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update product in Supabase: ${res.status} ${errText}`);
    }
    const updated = await res.json();
    return this.mapProductFromDb(updated[0] || { ...dbPayload, id });
  }

  async deleteProduct(id) {
    const res = await fetch(`${this.restUrl}/products?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok && res.status !== 204) {
      const errText = await res.text();
      throw new Error(`Failed to delete product in Supabase: ${res.status} ${errText}`);
    }
    return true;
  }

  // ORDERS API
  async fetchOrders() {
    const res = await fetch(`${this.restUrl}/orders?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch orders from Supabase: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data.map(this.mapOrderFromDb);
  }

  async insertOrder(order) {
    const dbPayload = this.mapOrderToDb(order);
    const res = await fetch(`${this.restUrl}/orders`, {
      method: 'POST',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(dbPayload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to insert order in Supabase: ${res.status} ${errText}`);
    }
    const inserted = await res.json();
    return this.mapOrderFromDb(inserted[0] || dbPayload);
  }

  async updateOrderStatus(id, newStatus, trackingNumber = '') {
    const payload = {
      order_status: newStatus
    };
    if (trackingNumber) {
      payload.tracking_number = trackingNumber;
    }
    if (newStatus === 'Delivered') {
      payload.payment_status = 'Paid / Settled';
    }

    const res = await fetch(`${this.restUrl}/orders?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update order status in Supabase: ${res.status} ${errText}`);
    }
    return true;
  }

  // REVIEWS API
  async fetchReviews(productId = null) {
    let endpoint = `${this.restUrl}/reviews?select=*&order=created_at.desc`;
    if (productId) {
      endpoint += `&product_id=eq.${encodeURIComponent(productId)}`;
    }
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch reviews from Supabase: ${res.status} ${errText}`);
    }
    return await res.json();
  }

  async insertReview({ productId, author, rating, comment }) {
    const res = await fetch(`${this.restUrl}/reviews`, {
      method: 'POST',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify({
        product_id: productId,
        author: author || 'Verified Buyer',
        rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
        comment: comment || 'Excellent quality and fast delivery.'
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to insert review in Supabase: ${res.status} ${errText}`);
    }
    return await res.json();
  }

  // Model Mappers
  mapProductFromDb(db) {
    if (!db) return null;
    return {
      id: db.id,
      name: db.name || 'Untitled Product',
      category: db.category || 'general',
      categoryName: db.category ? (db.category.charAt(0).toUpperCase() + db.category.slice(1)) : 'General',
      priceINR: Number(db.price_inr) || 0,
      priceUSD: Number(db.price_usd) || Math.round((Number(db.price_inr) || 0) * 0.012),
      originalPriceINR: Math.round((Number(db.price_inr) || 0) * 1.3),
      discountPercent: 20,
      description: db.description || '',
      origin: db.origin || 'Mumbai, India',
      material: db.material || 'Premium Quality',
      stockQty: Number(db.stock ?? 25),
      inStock: Number(db.stock ?? 25) > 0,
      featured: Boolean(db.featured),
      imageUrl: db.image_url || '',
      rating: 4.8,
      reviewsCount: 24,
      createdAt: db.created_at || new Date().toISOString()
    };
  }

  mapProductToDb(prod) {
    return {
      id: prod.id || `prod-${Date.now().toString().slice(-6)}`,
      name: prod.name || 'Untitled Product',
      category: (prod.category || 'general').toLowerCase().trim(),
      price_inr: Math.round(Number(prod.priceINR || prod.price_inr || 0)),
      price_usd: Math.round(Number(prod.priceUSD || prod.price_usd || 0)),
      description: prod.description || '',
      origin: prod.origin || 'Mumbai, India',
      material: prod.material || 'Premium Quality',
      stock: parseInt(prod.stockQty ?? prod.stock ?? 25, 10),
      featured: Boolean(prod.featured),
      image_url: prod.imageUrl || prod.image_url || ''
    };
  }

  mapOrderFromDb(db) {
    if (!db) return null;
    return {
      id: db.id,
      invoiceNumber: db.invoice_number || `INV-${db.id}`,
      customer: {
        name: db.customer_name || 'Guest Customer',
        email: db.customer_email || '',
        phone: db.customer_phone || '',
        address: db.customer_address || '',
        city: db.customer_city || '',
        pincode: db.customer_pincode || ''
      },
      items: Array.isArray(db.items) ? db.items : (typeof db.items === 'string' ? JSON.parse(db.items || '[]') : []),
      subtotalINR: Number(db.subtotal_inr) || 0,
      discountINR: Number(db.discount_inr) || 0,
      totalINR: Number(db.total_inr) || 0,
      paymentMode: db.payment_mode || 'UPI',
      paymentStatus: db.payment_status || 'Paid',
      orderStatus: db.order_status || 'New Order',
      trackingNumber: db.tracking_number || '',
      createdAt: db.created_at || new Date().toISOString()
    };
  }

  mapOrderToDb(order) {
    const cust = order.customer || {};
    return {
      id: order.id || `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoice_number: order.invoiceNumber || `INV-${Date.now()}`,
      customer_name: cust.name || 'Guest Customer',
      customer_email: cust.email || '',
      customer_phone: cust.phone || '',
      customer_address: cust.address || '',
      customer_city: cust.city || '',
      customer_pincode: cust.pincode || '',
      items: order.items || [],
      subtotal_inr: Number(order.subtotalINR ?? order.subtotal_inr ?? 0),
      discount_inr: Number(order.discountINR ?? order.discount_inr ?? 0),
      total_inr: Number(order.totalINR ?? order.total_inr ?? 0),
      payment_mode: order.paymentMode || 'UPI',
      payment_status: order.paymentStatus || 'Paid',
      order_status: order.orderStatus || 'New Order',
      tracking_number: order.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`
    };
  }
}

export const supabaseClient = new SupabaseClient();
