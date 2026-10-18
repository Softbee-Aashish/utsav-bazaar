// Central Reactive Product, Pricing, Discount, Supabase Cloud & Google Sheet Data Store
import { supabaseClient } from './SupabaseClient.js';

const STORAGE_KEYS = {
  PRODUCTS: 'ecom_products_v8',
  DISCOUNT_BAR: 'ecom_discount_bar_v8',
  GOOGLE_SHEET_URL: 'ecom_gsheet_url_v8',
  APPS_SCRIPT_URL: 'ecom_apps_script_url_v8',
  REVIEWS: 'ecom_product_reviews_v8',
  ORDERS: 'ecom_orders_v8',
  PAYMENTS: 'ecom_payment_ledger_v8',
  YOUPI_SETTINGS: 'ecom_youpi_settings_v8',
  ACTIVE_STAKING: 'ecom_active_staking_v8'
};

// Curated modern e-commerce production starter catalog (Clean, high-res Unsplash photography)
export const PRODUCTION_STARTER_PRODUCTS = [
  {
    id: "prod-001",
    name: "AuraPro Wireless Noise-Cancelling Headphones",
    category: "electronics",
    priceINR: 4999,
    priceUSD: 60,
    description: "Engineered for immersive acoustic depth with 40mm titanium drivers, active noise cancellation up to 35dB, memory foam ear cushions, and 40-hour battery life with USB-C fast charging.",
    origin: "Bengaluru, India",
    material: "Aircraft Matte Aluminum & Protein Leather",
    stock: 35,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-002",
    name: "Chronos Ultra Smart Fitness Watch",
    category: "electronics",
    priceINR: 3499,
    priceUSD: 42,
    description: "1.96-inch AMOLED always-on display, sapphire-shield glass, continuous SpO2 & dynamic heart rate monitoring, built-in GPS, 100+ workout modes, and 12-day battery standby.",
    origin: "Pune, India",
    material: "Aerospace Titanium Alloy & Fluoroelastomer Strap",
    stock: 42,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-003",
    name: "Oxford Tailored 100% Organic Cotton Shirt",
    category: "fashion",
    priceINR: 1899,
    priceUSD: 23,
    description: "Woven from long-staple certified organic cotton. Features a semi-spread collar, mother-of-pearl buttons, single-needle tailoring, and a tailored slim fit designed for all-day comfort.",
    origin: "Coimbatore, Tamil Nadu",
    material: "100% GOTS-Certified Organic Combed Cotton",
    stock: 50,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-004",
    name: "Nordic Minimalist LED Reading Desk Lamp",
    category: "home",
    priceINR: 2299,
    priceUSD: 28,
    description: "Architectural cantilever desk light with touch-dimming, 5 color temperature presets (2700K - 6500K), flicker-free anti-glare light guide, and an integrated 15W Qi wireless fast charger base.",
    origin: "Moradabad, Uttar Pradesh",
    material: "Anodized Matte Brass & Solid Walnut Wood Base",
    stock: 28,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-005",
    name: "Artisan Full-Grain Leather Notebook & Brass Pen Set",
    category: "stationery",
    priceINR: 1299,
    priceUSD: 16,
    description: "Refillable handcrafted vegetable-tanned leather binder with 200 pages of 120gsm fountain-pen-friendly ivory cotton paper. Includes a solid hexagonal raw brass rollerball pen.",
    origin: "Jaipur, Rajasthan",
    material: "Full-Grain Italian Saddle Leather & Solid Machined Brass",
    stock: 45,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-006",
    name: "Aeroclick Precision Ergonomic Wireless Mouse",
    category: "electronics",
    priceINR: 1799,
    priceUSD: 22,
    description: "57° natural handshake vertical ergonomic angle reducing wrist strain. Dual Bluetooth 5.2 + 2.4GHz wireless connectivity, silent micro-switches, and 4000 DPI hyper-accurate optical tracking.",
    origin: "Hyderabad, India",
    material: "Soft-Touch Matte Polymer & Textured Rubber Grips",
    stock: 30,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-007",
    name: "HydroPure Vacuum Insulated Stainless Steel Flask (750ml)",
    category: "home",
    priceINR: 1199,
    priceUSD: 15,
    description: "Double-wall vacuum insulation keeps beverages cold for 24 hours or piping hot for 12 hours. Sweat-proof powder coat finish, leak-proof magnetic straw lid, and 100% BPA-free 18/8 food-grade steel.",
    origin: "Mumbai, Maharashtra",
    material: "18/8 Pro-Grade Stainless Steel",
    stock: 60,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "prod-008",
    name: "Velvet Cloud Memory Foam Contour Pillow",
    category: "home",
    priceINR: 1599,
    priceUSD: 19,
    description: "Orthopedic ergonomic neck support cervical contour pillow made with slow-rebound cooling gel-infused memory foam and a breathable eucalyptus Tencel washable zipper cover.",
    origin: "Surat, Gujarat",
    material: "Gel-Infused Visco Memory Foam & Tencel Cover",
    stock: 22,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80"
  }
];

export class ProductStore {
  constructor() {
    this.products = [];
    this.orders = [];
    this.payments = [];
    this.youpiSettings = {
      mode: 'sandbox',
      upiVpa: '9625351970@axisbank',
      merchantVpa: '9625351970@axisbank',
      merchantName: 'e-com mart',
      gatewayUrl: 'http://localhost:7000',
      merchantId: '00000000-0000-0000-0000-000000000001',
      webhookSecret: 'sec_ecom_mart_2026',
      whatsappAuthEnabled: true,
      autoVerifySecs: 10
    };
    this.activeStakingSession = null;
    this.discountSettings = {
      enabled: true,
      text: "SPECIAL LAUNCH OFFER: FLAT 15% OFF ON ORDERS OVER ₹999 • USE CODE: SAVE15",
      couponCode: "SAVE15",
      discountPercent: 15
    };
    this.googleSheetUrl = "";
    this.appsScriptUrl = "";
    this.reviews = {};
    this.supabaseStatus = { connected: false, checking: false, lastSync: null };

    this.init();
  }

  init() {
    this.loadFromStorage();
    // Non-blocking asynchronous sync with Supabase cloud
    setTimeout(() => {
      this.syncFromSupabase();
    }, 100);
  }

  loadFromStorage() {
    // 1. Load cached products
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        this.products = JSON.parse(saved);
      } else {
        this.products = [];
      }
    } catch (e) {
      this.products = [];
    }

    // 2. Load Discount Bar settings
    try {
      const savedBar = localStorage.getItem(STORAGE_KEYS.DISCOUNT_BAR);
      if (savedBar) {
        this.discountSettings = { ...this.discountSettings, ...JSON.parse(savedBar) };
      }
    } catch (e) {}

    // 3. Load Google Sheet URL
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL);
      if (savedUrl) {
        this.googleSheetUrl = savedUrl;
        setTimeout(() => {
          this.syncFromGoogleSheet(savedUrl).catch(() => {});
        }, 1000);
      }
    } catch (e) {}

    // 4. Load Customer Reviews
    try {
      const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
      } else {
        this.reviews = {};
      }
    } catch (e) {
      this.reviews = {};
    }

    // 5. Load Orders
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      } else {
        this.orders = [];
      }
    } catch (e) {
      this.orders = [];
    }

    // 6. Load YouPI Gateway Settings
    try {
      const savedYoupi = localStorage.getItem(STORAGE_KEYS.YOUPI_SETTINGS);
      if (savedYoupi) {
        this.youpiSettings = { ...this.youpiSettings, ...JSON.parse(savedYoupi) };
      }
    } catch (e) {}

    // 7. Load Payment History Ledger
    try {
      const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (savedPayments) {
        this.payments = JSON.parse(savedPayments);
      } else {
        this.payments = [];
      }
    } catch (e) {
      this.payments = [];
    }
  }

  // --- SUPABASE CLOUD SYNCHRONIZATION ---
  async syncFromSupabase() {
    this.supabaseStatus.checking = true;
    try {
      const conn = await supabaseClient.checkConnection();
      this.supabaseStatus.connected = conn.ok;

      if (!conn.ok) {
        console.warn('Supabase connection check note:', conn);
        this.supabaseStatus.checking = false;
        return false;
      }

      // Fetch live products from Supabase
      const cloudProducts = await supabaseClient.fetchProducts();
      if (cloudProducts && cloudProducts.length > 0) {
        this.products = cloudProducts;
        this.saveProductsToStorage();
      } else if (this.products.length === 0) {
        // If Supabase is empty and local store is empty, auto-seed starter products
        console.log('🌱 Supabase database empty, auto-seeding modern starter catalog...');
        await this.seedProductionCatalogToSupabase();
      }

      // Fetch live orders from Supabase
      const cloudOrders = await supabaseClient.fetchOrders();
      if (cloudOrders && cloudOrders.length > 0) {
        this.orders = cloudOrders;
        this.saveOrdersToStorage();
      }

      this.supabaseStatus.lastSync = new Date();
      this.supabaseStatus.checking = false;

      window.dispatchEvent(new CustomEvent('supabase-synced', {
        detail: { productsCount: this.products.length, ordersCount: this.orders.length }
      }));
      return true;
    } catch (err) {
      console.warn('Supabase cloud sync warning:', err.message);
      this.supabaseStatus.connected = false;
      this.supabaseStatus.checking = false;
      return false;
    }
  }

  // Seed modern e-commerce starter catalog straight into Supabase PostgreSQL
  async seedProductionCatalogToSupabase() {
    const seeded = [];
    for (const item of PRODUCTION_STARTER_PRODUCTS) {
      try {
        const prod = await supabaseClient.insertProduct({
          id: item.id,
          name: item.name,
          category: item.category,
          priceINR: item.priceINR,
          priceUSD: item.priceUSD,
          description: item.description,
          origin: item.origin,
          material: item.material,
          stockQty: item.stock,
          featured: item.featured,
          imageUrl: item.image_url
        });
        seeded.push(prod);
      } catch (err) {
        console.warn(`Failed seeding product ${item.id}:`, err.message);
      }
    }

    if (seeded.length > 0) {
      this.products = seeded;
      this.saveProductsToStorage();
    }
    return seeded;
  }

  // --- PRODUCT MANAGEMENT ---
  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  async saveProduct(productData) {
    const isNew = !productData.id || !this.products.some(p => p.id === productData.id);
    const prodId = productData.id || `prod-${Date.now().toString().slice(-6)}`;
    const fullProduct = {
      ...productData,
      id: prodId,
      categoryName: this.getCategoryDisplayName(productData.category),
      inStock: (productData.stockQty ?? productData.stock ?? 25) > 0,
      stockQty: Number(productData.stockQty ?? productData.stock ?? 25),
      priceINR: Number(productData.priceINR ?? productData.price_inr ?? 0),
      priceUSD: Number(productData.priceUSD ?? productData.price_usd ?? Math.round((productData.priceINR || 0) * 0.012)),
      originalPriceINR: productData.originalPriceINR || Math.round((Number(productData.priceINR || 0)) * 1.3),
      rating: productData.rating || 4.8,
      reviewsCount: productData.reviewsCount || 18,
      imageUrl: productData.imageUrl || productData.image_url || ''
    };

    const idx = this.products.findIndex(p => p.id === prodId);
    if (idx >= 0) {
      this.products[idx] = fullProduct;
    } else {
      this.products.unshift(fullProduct);
    }
    this.saveProductsToStorage();

    // Async sync to Supabase Cloud
    try {
      if (isNew) {
        await supabaseClient.insertProduct(fullProduct);
      } else {
        await supabaseClient.updateProduct(prodId, fullProduct);
      }
    } catch (err) {
      console.warn('Supabase product sync error:', err.message);
    }

    return fullProduct;
  }

  async deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProductsToStorage();

    // Async delete from Supabase Cloud
    try {
      await supabaseClient.deleteProduct(id);
    } catch (err) {
      console.warn('Supabase product delete error:', err.message);
    }
  }

  saveProductsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('products-updated', { detail: { products: this.products } }));
  }

  // --- ORDER MANAGEMENT ---
  getOrders() {
    return [...this.orders];
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id) || null;
  }

  async recordOrder(orderData) {
    this.orders.unshift(orderData);

    // Auto deduct stock locally
    (orderData.items || []).forEach(item => {
      this.adjustProductStock(item.id, -(item.quantity || 1));
    });
    this.saveOrdersToStorage();

    // Sync order directly to Supabase PostgreSQL orders table
    try {
      await supabaseClient.insertOrder(orderData);
      // Update stocks in Supabase products table
      for (const item of (orderData.items || [])) {
        const prod = this.getProductById(item.id);
        if (prod) {
          await supabaseClient.updateProduct(item.id, {
            stock: prod.stockQty
          });
        }
      }
    } catch (err) {
      console.warn('Supabase record order error:', err.message);
    }

    // Sync to Google Sheets / Apps Script if configured
    this.syncOrderToBackend(orderData);
    return orderData;
  }

  async updateOrderStatus(orderId, newStatus, trackingNumber = '') {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;

    const oldStatus = order.orderStatus;
    order.orderStatus = newStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    if (newStatus === 'Delivered' && order.paymentMode && order.paymentMode.includes('COD')) {
      order.paymentStatus = 'Paid (COD Collected)';
    }

    // Restock cancelled or returned orders
    if ((newStatus === 'Cancelled' || newStatus === 'Returned') && oldStatus !== 'Cancelled' && oldStatus !== 'Returned') {
      (order.items || []).forEach(item => {
        this.adjustProductStock(item.id, item.quantity || 1);
      });
    }

    this.saveOrdersToStorage();

    // Sync update to Supabase Cloud
    try {
      await supabaseClient.updateOrderStatus(orderId, newStatus, order.trackingNumber || trackingNumber);
    } catch (err) {
      console.warn('Supabase update order status error:', err.message);
    }

    // Sync to Apps Script if configured
    this.syncOrderStatusToBackend(orderId, newStatus, order.trackingNumber);
    return true;
  }

  saveOrdersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('orders-updated', { detail: { orders: this.orders } }));
  }

  adjustProductStock(productId, delta) {
    const p = this.products.find(prod => prod.id === productId);
    if (p) {
      const current = Number(p.stockQty) || 0;
      p.stockQty = Math.max(0, current + delta);
      p.inStock = p.stockQty > 0;
      this.saveProductsToStorage();
    }
  }

  // --- REVIEWS MANAGEMENT ---
  getProductReviews(productId) {
    return this.reviews[productId] || [];
  }

  async addReview(productId, review) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const newRev = {
      id: review.id || `rev-${Date.now()}`,
      name: (review.name || 'Verified Buyer').trim(),
      city: (review.city || 'Verified Buyer').trim(),
      rating: Math.max(1, Math.min(5, parseInt(review.rating, 10) || 5)),
      comment: (review.comment || 'Excellent product, super fast delivery!').trim(),
      date: todayStr,
      verified: true
    };

    this.reviews[productId].unshift(newRev);

    // Update product rating average & count
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const revs = this.reviews[productId];
      const sum = revs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      prod.rating = parseFloat((sum / revs.length).toFixed(1));
      prod.reviewsCount = revs.length;
      this.saveProductsToStorage();
    }

    this.saveReviewsToStorage();

    // Async sync to Supabase reviews table
    try {
      await supabaseClient.insertReview({
        productId,
        author: newRev.name,
        rating: newRev.rating,
        comment: newRev.comment
      });
    } catch (err) {
      console.warn('Supabase review insert error:', err.message);
    }

    return newRev;
  }

  saveReviewsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {}
  }

  // --- CATEGORIES & HELPERS ---
  getActiveCategories() {
    const map = new Map();
    this.products.forEach(p => {
      const catKey = (p.category || 'general').trim().toLowerCase();
      if (!map.has(catKey)) {
        const displayName = this.getCategoryDisplayName(catKey);
        map.set(catKey, {
          key: catKey,
          name: displayName,
          count: 0
        });
      }
      map.get(catKey).count += 1;
    });
    return Array.from(map.values());
  }

  getCategoryDisplayName(cat) {
    if (!cat) return 'All Categories';
    const clean = cat.trim().toLowerCase();
    switch (clean) {
      case 'electronics': return 'Electronics & Gadgets';
      case 'fashion':
      case 'apparel': return 'Fashion & Apparel';
      case 'home':
      case 'decor': return 'Home & Living';
      case 'stationery':
      case 'statnery': return 'Stationery & Office';
      case 'beauty': return 'Beauty & Personal Care';
      case 'groceries':
      case 'organic': return 'Organic & Grocery';
      case 'accessories': return 'Watches & Accessories';
      default:
        return clean.split(/[-_ ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  // --- DISCOUNT BAR SETTINGS ---
  updateDiscountBar(enabled, text, couponCode, discountPercent) {
    this.discountSettings = {
      enabled: !!enabled,
      text: text || this.discountSettings.text,
      couponCode: (couponCode || 'SAVE15').toUpperCase(),
      discountPercent: parseInt(discountPercent, 10) || 15
    };
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOUNT_BAR, JSON.stringify(this.discountSettings));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('discount-bar-updated', { detail: this.discountSettings }));
  }

  // --- PAYMENT LEDGER & OMNICHANNEL GATEWAY ---
  recordPaymentSession(paymentData) {
    const session = {
      id: paymentData.id || `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orderId: paymentData.orderId,
      amountINR: paymentData.amountINR,
      paymentMode: paymentData.paymentMode || 'UPI',
      customer: paymentData.customer || {},
      status: paymentData.status || 'SUCCESS',
      timestamp: new Date().toISOString(),
      feeSavedINR: Math.round((paymentData.amountINR || 0) * 0.02)
    };
    this.payments.unshift(session);
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
    } catch (e) {}
    return session;
  }

  getPaymentAnalytics() {
    const successPayments = this.payments.filter(p => p.status === 'SUCCESS');
    const totalSettled = successPayments.reduce((sum, p) => sum + (Number(p.amountINR) || 0), 0);
    const totalFeesSaved = successPayments.reduce((sum, p) => sum + (Number(p.feeSavedINR) || 0), 0);
    const totalAttempts = this.payments.length;
    const successRate = totalAttempts > 0 ? Math.round((successPayments.length / totalAttempts) * 100) : 100;

    return {
      totalSettled,
      totalFeesSaved,
      successCount: successPayments.length,
      totalAttempts,
      successRate
    };
  }

  // --- GOOGLE SHEETS SYNC (HYBRID ARCHITECTURE) ---
  async syncFromGoogleSheet(url) {
    if (!url) return;
    let fetchUrl = url;
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetIdMatch && sheetIdMatch[1]) {
      const sheetId = sheetIdMatch[1];
      fetchUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&_t=${Date.now()}`;
    }

    try {
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Google Sheet fetch error: ${res.status}`);
      const csvText = await res.text();
      this.importFromCSV(csvText);
      this.googleSheetUrl = url;
      localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, url);
      return true;
    } catch (e) {
      console.warn('Google Sheet sync error:', e);
      return false;
    }
  }

  importFromCSV(csvText) {
    if (!csvText || !csvText.trim()) return;
    const rows = this.parseCSV(csvText);
    if (rows.length < 2) return;

    const headers = rows[0].map(h => (h || '').toLowerCase().trim().replace(/[^a-z0-9]/g, ''));
    const idIdx = headers.findIndex(h => h === 'id' || h === 'productid');
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'title');
    const catIdx = headers.findIndex(h => h === 'category');
    const priceIdx = headers.findIndex(h => h === 'priceinr' || h === 'price');
    const descIdx = headers.findIndex(h => h === 'description' || h === 'desc');
    const imgIdx = headers.findIndex(h => h === 'imageurl' || h === 'image' || h === 'img');
    const stockIdx = headers.findIndex(h => h === 'stock' || h === 'stockqty');

    if (nameIdx === -1 || priceIdx === -1) return;

    const parsedProducts = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0 || !row[nameIdx]) continue;

      const name = row[nameIdx].trim();
      const id = (idIdx !== -1 && row[idIdx]) ? row[idIdx].trim() : `prod-gs-${i}`;
      const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim().toLowerCase() : 'general';
      const priceINR = parseInt(row[priceIdx].replace(/[^0-9]/g, ''), 10) || 999;
      const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : '';
      const imageUrl = (imgIdx !== -1 && row[imgIdx]) ? row[imgIdx].trim() : '';
      const stock = (stockIdx !== -1 && row[stockIdx]) ? parseInt(row[stockIdx], 10) || 25 : 25;

      parsedProducts.push({
        id,
        name,
        category,
        categoryName: this.getCategoryDisplayName(category),
        priceINR,
        priceUSD: Math.round(priceINR * 0.012),
        originalPriceINR: Math.round(priceINR * 1.3),
        description,
        imageUrl,
        stockQty: stock,
        inStock: stock > 0,
        rating: 4.8,
        reviewsCount: 12
      });
    }

    if (parsedProducts.length > 0) {
      this.products = parsedProducts;
      this.saveProductsToStorage();
    }
  }

  parseCSV(text) {
    const result = [];
    let row = [];
    let inQuotes = false;
    let field = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push(field);
        field = '';
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        row.push(field);
        result.push(row);
        row = [];
        field = '';
      } else {
        field += c;
      }
    }
    if (field || row.length > 0) {
      row.push(field);
      result.push(row);
    }
    return result;
  }

  syncOrderToBackend(orderData) {
    if (!this.appsScriptUrl) return;
    try {
      fetch(this.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECORD_ORDER', order: orderData })
      }).catch(() => {});
    } catch (e) {}
  }

  syncOrderStatusToBackend(orderId, status, tracking) {
    if (!this.appsScriptUrl) return;
    try {
      fetch(this.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', orderId, status, tracking })
      }).catch(() => {});
    } catch (e) {}
  }
}

export const productStore = new ProductStore();
