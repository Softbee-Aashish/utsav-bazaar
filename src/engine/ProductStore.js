// Central Reactive Product, Pricing, Discount & Google Sheet Data Store
import { FESTIVE_PRODUCTS } from '../components/ProductData.js';

const STORAGE_KEYS = {
  PRODUCTS: 'utsav_products_v7',
  DISCOUNT_BAR: 'utsav_discount_bar_v6',
  GOOGLE_SHEET_URL: 'utsav_gsheet_url_v6',
  APPS_SCRIPT_URL: 'utsav_apps_script_url_v1',
  REVIEWS: 'utsav_product_reviews_v6',
  ORDERS: 'utsav_orders_v6',
  PAYMENTS: 'utsav_payment_ledger_v2',
  YOUPI_SETTINGS: 'utsav_youpi_settings_v2',
  ACTIVE_STAKING: 'utsav_active_staking_v2'
};

export class ProductStore {
  constructor() {
    this.products = [];
    this.orders = [];
    this.payments = [];
    this.youpiSettings = {
      mode: 'sandbox', // 'sandbox' (Direct Bank UPI) | 'connected' (YouPI Local Daemon)
      upiVpa: '9625351970@axisbank',
      merchantVpa: '9625351970@axisbank',
      merchantName: 'Utsav Bazaar Crafts',
      gatewayUrl: 'http://localhost:7000',
      merchantId: '00000000-0000-0000-0000-000000000001',
      webhookSecret: 'sec_utsav_youpi_2026',
      whatsappAuthEnabled: true,
      autoVerifySecs: 12
    };
    this.activeStakingSession = null;
    this.discountSettings = {
      enabled: true,
      text: "DIWALI MAHOTSAV SALE: FLAT 15% OFF ALL HANDCRAFTED OFFERINGS • USE CODE: DIWALI2026",
      couponCode: "DIWALI2026",
      discountPercent: 15
    };
    this.googleSheetUrl = "";
    this.appsScriptUrl = "";
    this.reviews = {};

    this.init();
  }

  init() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    // Purge legacy static catalog cache if present
    try {
      if (localStorage.getItem('utsav_products_v6')) {
        localStorage.removeItem('utsav_products_v6');
      }
    } catch (e) {}

    // 1. Load Products (100% Dynamic - starts with empty catalog unless products added via Admin / API)
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        this.products = JSON.parse(saved);
      } else {
        this.products = [];
      }
    } catch (e) {
      console.warn("Could not load products from storage", e);
      this.products = [];
    }

    // 2. Load Discount Bar settings
    try {
      const savedBar = localStorage.getItem(STORAGE_KEYS.DISCOUNT_BAR);
      if (savedBar) {
        this.discountSettings = { ...this.discountSettings, ...JSON.parse(savedBar) };
      }
    } catch (e) {}

    // 3. Load Google Sheet URL & auto background sync
    try {
      const savedUrl = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEET_URL);
      if (savedUrl) {
        this.googleSheetUrl = savedUrl;
        // Background sync on boot so edits in Google Sheet reflect immediately
        setTimeout(() => {
          this.syncFromGoogleSheet(savedUrl).catch(err => {
            console.warn("Auto Google Sheet background sync note:", err.message);
          });
        }, 500);
      }
    } catch (e) {}

    // 4. Load Customer Reviews & Ratings
    try {
      const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
        // Clean out any legacy mock reviews
        let cleaned = false;
        Object.keys(this.reviews).forEach(k => {
          const before = (this.reviews[k] || []).length;
          this.reviews[k] = (this.reviews[k] || []).filter(r => 
            r.name !== 'Sunita Deshmukh' && 
            r.name !== 'Rajesh Kulkarni' && 
            r.name !== 'Anil Singhania' && 
            !['rev-1', 'rev-2', 'rev-3'].includes(r.id)
          );
          if (this.reviews[k].length === 0) delete this.reviews[k];
          if ((this.reviews[k] || []).length !== before) cleaned = true;
        });
        if (cleaned) this.saveReviewsToStorage();
      } else {
        this.reviews = {};
      }
    } catch (e) {
      this.reviews = {};
    }

    // 5. Load Merchant Orders Pipeline (100% Real Live Orders)
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
        // Purge any legacy mock orders from earlier demos
        const beforeLen = this.orders.length;
        this.orders = this.orders.filter(o => 
          o.customer?.name !== 'Aarav Sharma' && 
          o.customer?.email !== 'aarav.sharma@utsavbazaar.in' && 
          o.customer?.name !== 'Meera Rajput' &&
          o.customer?.name !== 'Vikramaditya Singhania' &&
          o.customer?.name !== 'Ananya Roy' &&
          o.customer?.name !== 'Devendra Patel' &&
          !['UB-ORD-849102', 'UB-ORD-771249', 'UB-ORD-652391', 'UB-ORD-519280', 'UB-ORD-410928'].includes(o.id)
        );
        if (this.orders.length !== beforeLen) this.saveOrdersToStorage();
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

    // 7. Load Master Payment History Ledger (100% Real Live Payments)
    try {
      const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (savedPayments) {
        this.payments = JSON.parse(savedPayments);
        // Purge any legacy mock payments
        const beforeLen = this.payments.length;
        this.payments = this.payments.filter(p =>
          p.customer?.name !== 'Aarav Sharma' &&
          p.customer?.email !== 'aarav.sharma@utsavbazaar.in' &&
          p.customer?.name !== 'Meera Rajput' &&
          p.customer?.name !== 'Vikramaditya Singhania' &&
          p.customer?.name !== 'Ananya Roy' &&
          p.customer?.name !== 'Devendra Patel' &&
          !['YOUPI-PAY-849102', 'YOUPI-PAY-771249', 'YOUPI-PAY-652391', 'YOUPI-PAY-519280', 'YOUPI-PAY-410928'].includes(p.id)
        );
        if (this.payments.length !== beforeLen) this.savePaymentsToStorage();
      } else {
        this.payments = [];
      }
    } catch (e) {
      this.payments = [];
    }

    // 8. Load Active Staking Session
    try {
      const savedStaking = localStorage.getItem(STORAGE_KEYS.ACTIVE_STAKING);
      if (savedStaking) {
        const parsed = JSON.parse(savedStaking);
        if (parsed && parsed.expiresAt > Date.now()) {
          this.activeStakingSession = parsed;
        } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_STAKING);
          this.activeStakingSession = null;
        }
      }
    } catch (e) {
      this.activeStakingSession = null;
    }
  }

  saveOrdersToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    } catch (e) {
      console.warn("Could not save orders", e);
    }
    window.dispatchEvent(new CustomEvent('orders-updated', { detail: { orders: this.orders } }));
  }

  getOrders() {
    return [...this.orders];
  }

  getOrderById(id) {
    return this.orders.find(o => o.id === id) || null;
  }

  recordOrder(orderData) {
    this.orders.unshift(orderData);
    // Auto deduct stock for items ordered
    (orderData.items || []).forEach(item => {
      this.adjustProductStock(item.id, -(item.quantity || 1));
    });
    this.saveOrdersToStorage();

    // Trigger async sync with Apps Script if configured
    this.syncOrderToBackend(orderData);
    return orderData;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      const oldStatus = order.orderStatus;
      order.orderStatus = newStatus;
      if (newStatus === 'Delivered' && order.paymentMode.includes('COD')) {
        order.paymentStatus = 'Paid (COD Collected)';
      }
      // If order is Cancelled or Returned, restore stock automatically!
      if ((newStatus === 'Cancelled' || newStatus === 'Returned') && oldStatus !== 'Cancelled' && oldStatus !== 'Returned') {
        (order.items || []).forEach(item => {
          this.adjustProductStock(item.id, item.quantity || 1);
        });
      }
      this.saveOrdersToStorage();

      // Sync status update to Apps Script if configured
      this.syncOrderStatusToBackend(orderId, newStatus, order.trackingNumber);
      return true;
    }
    return false;
  }

  toggleCodVerification(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.codVerified = !order.codVerified;
      this.saveOrdersToStorage();
      return order.codVerified;
    }
    return false;
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

  deleteOrder(orderId) {
    this.orders = this.orders.filter(o => o.id !== orderId);
    this.saveOrdersToStorage();
  }

  getDashboardStats() {
    const validOrders = this.orders.filter(o => o.orderStatus !== 'Cancelled');
    const totalOrders = validOrders.length;
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.totalINR) || 0), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // Net profit calculation: Revenue minus (artisan cost + packaging + shipping)
    let totalCost = 0;
    validOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const p = this.products.find(prod => prod.id === item.id);
        const costPerUnit = p ? (p.costPriceINR || Math.round(p.priceINR * 0.55)) : Math.round((item.priceINR || 0) * 0.55);
        totalCost += costPerUnit * (item.quantity || 1);
      });
      totalCost += 150; // Packaging & Insured Shipping average
    });
    const netProfit = Math.max(0, totalRevenue - totalCost);
    const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    const newOrdersCount = this.orders.filter(o => o.orderStatus === 'New Order' || o.orderStatus === 'Processing').length;
    const packedCount = this.orders.filter(o => o.orderStatus === 'Packed').length;
    const unshippedCount = this.orders.filter(o => ['New Order', 'Processing', 'Packed'].includes(o.orderStatus)).length;
    const shippedCount = this.orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Dispatched').length;
    const outForDeliveryCount = this.orders.filter(o => o.orderStatus === 'Out for Delivery').length;
    const deliveredCount = this.orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledCount = this.orders.filter(o => o.orderStatus === 'Cancelled' || o.orderStatus === 'Returned').length;

    // Prepaid vs COD Breakdown
    const prepaidOrders = validOrders.filter(o => !o.paymentMode.includes('COD'));
    const codOrders = validOrders.filter(o => o.paymentMode.includes('COD'));
    const prepaidAmount = prepaidOrders.reduce((sum, o) => sum + (Number(o.totalINR) || 0), 0);
    const codAmount = codOrders.reduce((sum, o) => sum + (Number(o.totalINR) || 0), 0);

    return {
      totalOrders,
      totalRevenue,
      netProfit,
      profitMargin,
      avgOrderValue,
      unshippedCount,
      newOrdersCount,
      packedCount,
      shippedCount,
      outForDeliveryCount,
      deliveredCount,
      cancelledCount,
      processingCount: newOrdersCount,
      dispatchedCount: shippedCount,
      prepaidCount: prepaidOrders.length,
      codCount: codOrders.length,
      prepaidAmount,
      codAmount
    };
  }

  getCustomerDirectory() {
    const customerMap = {};
    this.orders.forEach(o => {
      const cust = o.customer || {};
      const key = (cust.phone || cust.email || cust.name || 'guest').trim().toLowerCase();
      if (!customerMap[key]) {
        customerMap[key] = {
          key,
          name: cust.name || 'Festive Patron',
          email: cust.email || '',
          phone: cust.phone || '',
          city: cust.city || '',
          address: cust.address || '',
          pincode: cust.pincode || '',
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          lastOrderDate: o.date,
          vip: false
        };
      }
      customerMap[key].totalOrders += 1;
      if (o.orderStatus !== 'Cancelled') {
        customerMap[key].totalSpent += Number(o.totalINR) || 0;
      }
      customerMap[key].orders.push(o.id);
      if (customerMap[key].totalOrders >= 2 || customerMap[key].totalSpent >= 5000) {
        customerMap[key].vip = true;
      }
    });

    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  // --- TWO-WAY APPS SCRIPT SYNC ---
  setAppsScriptUrl(url) {
    this.appsScriptUrl = url ? url.trim() : '';
    localStorage.setItem(STORAGE_KEYS.APPS_SCRIPT_URL, this.appsScriptUrl);
  }

  getAppsScriptUrl() {
    if (!this.appsScriptUrl) {
      this.appsScriptUrl = localStorage.getItem(STORAGE_KEYS.APPS_SCRIPT_URL) || '';
    }
    return this.appsScriptUrl;
  }

  async syncOrderToBackend(order) {
    const url = this.getAppsScriptUrl();
    if (!url) return;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "CREATE_ORDER",
          order: {
            OrderID: order.id,
            InvoiceID: order.invoiceNumber,
            Date: order.date,
            CustomerName: order.customer?.name,
            Email: order.customer?.email,
            Phone: order.customer?.phone,
            CityPin: `${order.customer?.city || ''} ${order.customer?.pincode || ''}`,
            Items: order.items,
            TotalAmount: order.totalINR,
            PaymentMethod: order.paymentMode,
            PaymentStatus: order.paymentStatus,
            TrackingID: order.trackingNumber
          }
        })
      });
    } catch (e) {
      console.warn("Apps Script syncOrderToBackend failed", e);
    }
  }

  async syncOrderStatusToBackend(orderId, newStatus, trackingId) {
    const url = this.getAppsScriptUrl();
    if (!url) return;
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "UPDATE_ORDER_STATUS",
          OrderID: orderId,
          NewStatus: newStatus,
          TrackingID: trackingId
        })
      });
    } catch (e) {
      console.warn("Apps Script syncOrderStatusToBackend failed", e);
    }
  }

  exportOrdersToCSV() {
    const headers = [
      "Order ID",
      "Invoice Number",
      "Order Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "City",
      "Address",
      "Total Amount (INR)",
      "Payment Mode",
      "Payment Status",
      "Order Status",
      "Tracking Number",
      "Items Count",
      "Items Summary"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = this.orders.map(o => {
      const itemsSummary = (o.items || []).map(i => `${i.name} (x${i.quantity})`).join('; ');
      return [
        escapeCsv(o.id),
        escapeCsv(o.invoiceNumber),
        escapeCsv(o.date),
        escapeCsv(o.customer?.name),
        escapeCsv(o.customer?.email),
        escapeCsv(o.customer?.phone),
        escapeCsv(o.customer?.city),
        escapeCsv(o.customer?.address),
        o.totalINR || 0,
        escapeCsv(o.paymentMode),
        escapeCsv(o.paymentStatus),
        escapeCsv(o.orderStatus),
        escapeCsv(o.trackingNumber),
        (o.items || []).length,
        escapeCsv(itemsSummary)
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  // All reviews are 100% dynamic and created by real customers or via the verified review portal

  saveProductsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    } catch (e) {
      console.warn("Storage save error", e);
    }
    this.notifyUpdate();
  }

  saveDiscountBarToStorage() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.DISCOUNT_BAR, JSON.stringify(this.discountSettings));
    } catch (e) {}
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('discount-bar-updated', { detail: this.discountSettings }));
  }

  saveReviewsToStorage() {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {}
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('reviews-updated'));
  }

  notifyUpdate() {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('products-updated', { detail: { products: this.products } }));
  }

  getProducts() {
    return [...this.products];
  }

  getProductById(id) {
    return this.products.find(p => p.id === id) || null;
  }

  saveProduct(productData) {
    const idx = this.products.findIndex(p => p.id === productData.id);
    if (idx >= 0) {
      this.products[idx] = { ...this.products[idx], ...productData };
    } else {
      const newId = productData.id || `ub-${Date.now().toString().slice(-4)}`;
      this.products.unshift({ ...productData, id: newId });
    }
    this.saveProductsToStorage();
    return true;
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProductsToStorage();
  }

  applyCategoryDiscount(category, percent) {
    const pVal = parseFloat(percent) || 0;
    this.products = this.products.map(p => {
      if (category === 'all' || p.category === category) {
        const orig = p.originalPriceINR || Math.round(p.priceINR * 1.25);
        const newPrice = Math.round(orig * (1 - pVal / 100));
        return {
          ...p,
          originalPriceINR: orig,
          priceINR: newPrice,
          priceUSD: Math.round(newPrice * 0.012),
          discountPercent: pVal
        };
      }
      return p;
    });
    this.saveProductsToStorage();
  }

  updateDiscountBar(enabled, text, couponCode, discountPercent) {
    this.discountSettings = {
      enabled: !!enabled,
      text: text || this.discountSettings.text,
      couponCode: (couponCode || 'DIWALI2026').toUpperCase(),
      discountPercent: parseInt(discountPercent, 10) || 15
    };
    this.saveDiscountBarToStorage();
  }

  getProductReviews(productId) {
    return this.reviews[productId] || [];
  }

  getAllReviewsList() {
    const all = [];
    Object.keys(this.reviews).forEach(prodId => {
      const p = this.products.find(item => item.id === prodId);
      const revs = this.reviews[prodId] || [];
      revs.forEach(r => {
        all.push({
          ...r,
          productId: prodId,
          productName: p ? p.name : 'Festive Offering',
          productCategory: p ? (p.categoryName || p.category) : '',
          productImage: p ? (p.imageUrl || '') : ''
        });
      });
    });
    return all.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  addReview(productId, review) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = [];
    }

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const newRev = {
      id: review.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: (review.name || 'Auspicious Patron').trim(),
      city: (review.city || 'Verified Buyer').trim(),
      avatarUrl: (review.avatarUrl || '').trim(),
      photoUrl: (review.photoUrl || review.imageUrl || '').trim(),
      rating: Math.max(1, Math.min(5, parseInt(review.rating, 10) || 5)),
      title: (review.title || '').trim(),
      comment: (review.comment || 'Exquisite handcrafted offering, truly blessed!').trim(),
      date: review.date ? review.date.trim() : todayStr,
      verified: review.verified !== false
    };

    this.reviews[productId].unshift(newRev);

    // Update product rating average & count dynamically
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const revs = this.reviews[productId];
      const sum = revs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      prod.rating = parseFloat((sum / revs.length).toFixed(1));
      prod.reviewsCount = revs.length;
      this.saveProductsToStorage();
    }

    this.saveReviewsToStorage();
    return newRev;
  }

  deleteReview(productId, reviewId) {
    if (!this.reviews[productId]) return false;
    const initialLen = this.reviews[productId].length;
    this.reviews[productId] = this.reviews[productId].filter(r => r.id !== reviewId);

    if (this.reviews[productId].length === initialLen) return false;

    // Recalculate product rating average & count
    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      const revs = this.reviews[productId];
      if (revs.length > 0) {
        const sum = revs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
        prod.rating = parseFloat((sum / revs.length).toFixed(1));
        prod.reviewsCount = revs.length;
      } else {
        prod.rating = 5.0;
        prod.reviewsCount = 0;
      }
      this.saveProductsToStorage();
    }

    this.saveReviewsToStorage();
    return true;
  }

  // --- GOOGLE SHEETS & EXCEL CSV INTEGRATION ---
  exportToCSV() {
    const headers = [
      "ID",
      "Name",
      "Category",
      "CategoryName",
      "PriceINR",
      "OriginalPriceINR",
      "DiscountPercent",
      "Rating",
      "ReviewsCount",
      "Origin",
      "Badge",
      "InStock",
      "ImageURL",
      "Tagline",
      "Description"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = this.products.map(p => [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.category),
      escapeCsv(p.categoryName),
      p.priceINR,
      p.originalPriceINR || Math.round(p.priceINR * 1.25),
      p.discountPercent || 0,
      p.rating,
      p.reviewsCount,
      escapeCsv(p.origin),
      escapeCsv(p.badge),
      p.inStock ? "TRUE" : "FALSE",
      escapeCsv(p.imageUrl || ""),
      escapeCsv(p.tagline),
      escapeCsv(p.description)
    ].join(","));

    return [headers.join(","), ...rows].join("\r\n");
  }

  importFromCSV(csvText) {
    try {
      const lines = this.parseCSVLines(csvText);
      if (lines.length < 2) throw new Error("CSV file must contain at least a header and 1 row.");

      const rawHeaders = lines[0].map(h => (h || '').trim());
      const headers = rawHeaders.map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));
      
      const idIdx = headers.indexOf("id") !== -1 ? headers.indexOf("id") : headers.indexOf("productid");
      const nameIdx = headers.indexOf("name") !== -1 ? headers.indexOf("name") : headers.indexOf("productname");
      const catIdx = headers.indexOf("category");
      const priceIdx = headers.indexOf("priceinr") !== -1 ? headers.indexOf("priceinr") : (headers.indexOf("price") !== -1 ? headers.indexOf("price") : headers.indexOf("saleprice"));
      const origPriceIdx = headers.indexOf("originalpriceinr") !== -1 ? headers.indexOf("originalpriceinr") : (headers.indexOf("originalprice") !== -1 ? headers.indexOf("originalprice") : headers.indexOf("mrp"));
      const discIdx = headers.indexOf("discountpercent") !== -1 ? headers.indexOf("discountpercent") : headers.indexOf("discount");
      const imgIdx = headers.indexOf("imageurl") !== -1 ? headers.indexOf("imageurl") : (headers.indexOf("image") !== -1 ? headers.indexOf("image") : headers.indexOf("img"));
      const originIdx = headers.indexOf("origin");
      const badgeIdx = headers.indexOf("badge");
      const tagIdx = headers.indexOf("tagline");
      const descIdx = headers.indexOf("description") !== -1 ? headers.indexOf("description") : headers.indexOf("desc");
      const stockIdx = headers.indexOf("instock") !== -1 ? headers.indexOf("instock") : headers.indexOf("stock");
      const stockQtyIdx = headers.indexOf("stockqty") !== -1 ? headers.indexOf("stockqty") : headers.indexOf("quantity");
      const festIdx = headers.indexOf("festival");
      const festTagIdx = headers.indexOf("festivaltag");

      if (nameIdx === -1 || priceIdx === -1) {
        throw new Error("CSV must include at least 'Name' and 'PriceINR' columns.");
      }

      const importedProducts = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

        const name = row[nameIdx] ? row[nameIdx].trim() : '';
        if (!name) continue;

        const id = (idIdx !== -1 && row[idIdx]) ? row[idIdx].trim() : `ub-${100 + i}`;
        const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim().toLowerCase() : 'decor';
        const priceINR = parseFloat(row[priceIdx]) || 999;
        const originalPriceINR = (origPriceIdx !== -1 && parseFloat(row[origPriceIdx])) || Math.round(priceINR * 1.25);
        const discountPercent = (discIdx !== -1 && parseFloat(row[discIdx])) || Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100);
        const imageUrl = (imgIdx !== -1 && row[imgIdx]) ? row[imgIdx].trim() : '';
        const origin = (originIdx !== -1 && row[originIdx]) ? row[originIdx].trim() : 'India';
        const badge = (badgeIdx !== -1 && row[badgeIdx]) ? row[badgeIdx].trim() : 'Bestseller';
        const tagline = (tagIdx !== -1 && row[tagIdx]) ? row[tagIdx].trim() : 'Handcrafted Artisan Essential';
        const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : 'Premium quality handcrafted offering.';
        const inStock = stockIdx !== -1 ? (row[stockIdx].trim().toUpperCase() !== 'FALSE') : true;
        const stockQty = (stockQtyIdx !== -1 && parseInt(row[stockQtyIdx])) || (inStock ? 50 : 0);
        const festival = (festIdx !== -1 && row[festIdx]) ? row[festIdx].trim().toLowerCase() : 'festive';
        const festivalTag = (festTagIdx !== -1 && row[festTagIdx]) ? row[festTagIdx].trim() : '✨ Handcrafted Offering';

        // Preserve existing icon or fallback
        const existing = this.getProductById(id);
        const svgIcon = existing ? existing.svgIcon : (category === 'diyas' ? 'diya' : (['statnery', 'stationery'].includes(category) ? 'box' : 'decor'));
        const accentColor = existing ? existing.accentColor : '#D4AF37';

        importedProducts.push({
          id,
          name,
          category,
          categoryName: this.getCategoryDisplayName(category),
          priceINR,
          originalPriceINR,
          priceUSD: Math.round(priceINR * 0.012),
          discountPercent,
          rating: existing ? existing.rating : 4.9,
          reviewsCount: existing ? existing.reviewsCount : 120,
          origin,
          badge,
          inStock,
          stockQty,
          imageUrl,
          tagline,
          description,
          festival,
          festivalTag,
          features: existing ? existing.features : ["Handcrafted by master Indian artisans", "Blessed festive packaging"],
          accentColor,
          svgIcon
        });
      }

      if (importedProducts.length > 0) {
        this.products = importedProducts;
        this.saveProductsToStorage();
        return { success: true, count: importedProducts.length };
      } else {
        throw new Error("No valid products found in CSV.");
      }
    } catch (err) {
      console.error("CSV import error:", err);
      return { success: false, error: err.message };
    }
  }

  async syncFromGoogleSheet(url) {
    let targetUrl = (url || this.googleSheetUrl || '').trim();
    if (!targetUrl) throw new Error("No Google Sheet Published CSV URL provided.");

    // Support automatic conversion from standard Google Sheet edit link:
    // e.g. https://docs.google.com/spreadsheets/d/1XwY.../edit#gid=0 -> https://docs.google.com/spreadsheets/d/1XwY.../export?format=csv
    const match = targetUrl.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      const sheetId = match[1];
      if (!targetUrl.includes('export?format=csv') && !targetUrl.includes('pub?output=csv')) {
        targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }
    }

    this.googleSheetUrl = targetUrl;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, targetUrl);

    // Cache-busting timestamp parameter to prevent stale 5-minute CDN caches
    const sep = targetUrl.includes('?') ? '&' : '?';
    const fetchUrl = `${targetUrl}${sep}_t=${Date.now()}`;

    const res = await fetch(fetchUrl, {
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Google Sheet (HTTP ${res.status}). Verify sheet is Published to Web as CSV or link sharing is set to 'Anyone with the link can view'.`);
    }

    const csvData = await res.text();
    return this.importFromCSV(csvData);
  }

  parseCSVLines(text) {
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
          i++; // skip escaped quote
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

  getActiveCategories() {
    const map = new Map();
    this.products.forEach(p => {
      const catKey = (p.category || 'decor').trim().toLowerCase();
      if (!map.has(catKey)) {
        const displayName = p.categoryName || this.getCategoryDisplayName(catKey) || (catKey.charAt(0).toUpperCase() + catKey.slice(1));
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
    if (!cat) return 'All Offerings';
    const clean = cat.trim().toLowerCase();
    switch (clean) {
      case 'diyas': return 'Royal Diyas & Brass';
      case 'apparel': return 'Royal Silk & Attire';
      case 'torans': return 'Torans & Wall Hangings';
      case 'decor': return 'Royal Urlis & Home Decor';
      case 'hampers': return 'Festive Hampers';
      case 'lanterns': return 'Lanterns & Decor';
      case 'heirlooms': return 'Artisanal Heirlooms';
      case 'statnery':
      case 'stationery': return 'Stationery & Writing';
      default:
        return clean.split(/[-_ ]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  getDefaultFestival(id, category) {
    switch (id) {
      case 'ub-001': return { festival: 'diwali', festivalTag: '🪔 Deepawali Pujan' };
      case 'ub-002': return { festival: 'bhai-dooj', festivalTag: '🌸 Bhai Dooj Shahi Hamper' };
      case 'ub-003': return { festival: 'diwali', festivalTag: '🪔 Diwali Kandil' };
      case 'ub-004': return { festival: 'karwa-chauth', festivalTag: '🌕 Karwa Chauth Shringar' };
      case 'ub-005': return { festival: 'chhath-puja', festivalTag: '☀️ Chhath Surya Arghya' };
      case 'ub-006': return { festival: 'dhanteras', festivalTag: '🪙 Dhanteras Auspicious Brass' };
      case 'ub-007': return { festival: 'diwali', festivalTag: '🪔 Diwali Bandhanwar' };
      case 'ub-008': return { festival: 'navratri', festivalTag: '🌺 Navratri & Durga Puja' };
      case 'ub-009': return { festival: 'wedding', festivalTag: '👑 Vivah & Sangeet' };
      case 'ub-010': return { festival: 'karwa-chauth', festivalTag: '🌕 Karwa Chauth Vrat Thali' };
      default:
        if (category === 'diyas' || category === 'torans') return { festival: 'diwali', festivalTag: '🪔 Diwali Special' };
        if (category === 'apparel' || category === 'heirlooms') return { festival: 'wedding', festivalTag: '👑 Vivah Special' };
        return { festival: 'diwali', festivalTag: '✨ Festive Special' };
    }
  }

  // --- YOUPI-PG SOVEREIGN PAYMENT GATEWAY & STAKING LEDGER METHODS ---
  saveYoupiSettingsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.YOUPI_SETTINGS, JSON.stringify(this.youpiSettings));
    } catch (e) {}
  }

  savePaymentsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
    } catch (e) {}
  }

  saveActiveStakingToStorage() {
    try {
      if (this.activeStakingSession) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STAKING, JSON.stringify(this.activeStakingSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_STAKING);
      }
    } catch (e) {}
  }

  // All payment sessions are 100% dynamic, generated upon customer checkout initiation

  getYoupiSettings() {
    return { ...this.youpiSettings };
  }

  saveYoupiSettings(newSettings) {
    this.youpiSettings = { ...this.youpiSettings, ...newSettings };
    this.saveYoupiSettingsToStorage();
    return this.youpiSettings;
  }

  getPaymentLedger() {
    return [...this.payments];
  }

  recordPaymentSession(data) {
    const paymentId = `YOUPI-PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    const feeSavedINR = Math.round((Number(data.amountINR || 0) * 0.0295) * 100) / 100;
    const session = {
      id: paymentId,
      orderId: data.orderId,
      invoiceNumber: data.invoiceNumber || `UB-INV-2026-${paymentId.slice(-6)}`,
      customer: data.customer || {},
      amountINR: Number(data.amountINR || 0),
      feeSavedINR,
      paymentMode: data.paymentMode || 'UPI_QR',
      upiVpa: this.youpiSettings.upiVpa || 'utsavbazaar@icici',
      utr: data.utr || '',
      channel: data.channel || (this.youpiSettings.mode === 'connected' ? 'CONNECTED_GATEWAY' : 'BANK_SMS'),
      status: data.status || 'PENDING',
      timestamp: Date.now(),
      durationSecs: 0,
      slotNumber: 1
    };

    // Prepend to ledger
    this.payments.unshift(session);
    this.savePaymentsToStorage();

    // Set active staking session with 5-minute countdown
    this.activeStakingSession = {
      paymentId: session.id,
      orderId: session.orderId,
      amountINR: session.amountINR,
      customerName: session.customer?.name || 'Customer',
      customerPhone: session.customer?.phone || '',
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000, // 5:00 minutes
      status: 'WAITING_PAYMENT',
      slot: 1,
      vpa: session.upiVpa
    };
    this.saveActiveStakingToStorage();

    return session;
  }

  updatePaymentStatus(paymentId, status, utr = '', channel = '', paymentMode = '') {
    const payment = this.payments.find(p => p.id === paymentId || p.orderId === paymentId);
    if (payment) {
      payment.status = status;
      if (utr) payment.utr = utr;
      if (channel) payment.channel = channel;
      if (paymentMode) payment.paymentMode = paymentMode;
      if (status === 'SUCCESS' && payment.timestamp) {
        payment.durationSecs = Math.max(1, Math.round((Date.now() - payment.timestamp) / 1000));
      }
      this.savePaymentsToStorage();

      if (status === 'SUCCESS' || status === 'FAILED' || status === 'EXPIRED') {
        if (this.activeStakingSession && (this.activeStakingSession.paymentId === payment.id || this.activeStakingSession.orderId === payment.orderId)) {
          this.activeStakingSession = null;
          this.saveActiveStakingToStorage();
        }
      }
      return true;
    }
    return false;
  }

  manualVerifyPayment(paymentId, customUtr = '') {
    const payment = this.payments.find(p => p.id === paymentId);
    if (payment) {
      const finalUtr = customUtr || payment.utr || `${Math.floor(400000000000 + Math.random() * 599999999999)}`;
      payment.status = 'SUCCESS';
      payment.utr = finalUtr;
      payment.channel = 'MANUAL_OVERRIDE';
      payment.durationSecs = Math.max(1, Math.round((Date.now() - payment.timestamp) / 1000));
      this.savePaymentsToStorage();

      // Also update matching order in orders list
      const ord = this.orders.find(o => o.id === payment.orderId);
      if (ord) {
        ord.paymentStatus = 'Paid (Verified - Manual Override)';
        this.saveOrdersToStorage();
      }

      if (this.activeStakingSession && this.activeStakingSession.paymentId === payment.id) {
        this.activeStakingSession = null;
        this.saveActiveStakingToStorage();
      }
      return true;
    }
    return false;
  }

  getActiveStakingSession() {
    if (!this.activeStakingSession) return null;
    if (Date.now() > this.activeStakingSession.expiresAt) {
      this.updatePaymentStatus(this.activeStakingSession.paymentId, 'EXPIRED');
      this.activeStakingSession = null;
      this.saveActiveStakingToStorage();
      return null;
    }
    return this.activeStakingSession;
  }

  clearActiveStakingSession() {
    this.activeStakingSession = null;
    this.saveActiveStakingToStorage();
  }

  getPaymentAnalytics() {
    const successPayments = this.payments.filter(p => p.status === 'SUCCESS');
    const totalSettled = successPayments.reduce((sum, p) => sum + (Number(p.amountINR) || 0), 0);
    const totalFeesSaved = successPayments.reduce((sum, p) => sum + (Number(p.feeSavedINR) || 0), 0);
    const totalAttempts = this.payments.length;
    const successRate = totalAttempts > 0 ? Math.round((successPayments.length / totalAttempts) * 100) : 100;
    
    let totalSecs = 0;
    successPayments.forEach(p => { totalSecs += (p.durationSecs || 14); });
    const avgDuration = successPayments.length > 0 ? Math.round(totalSecs / successPayments.length) : 12;

    const channels = {
      bankSms: this.payments.filter(p => p.channel === 'BANK_SMS').length,
      androidApk: this.payments.filter(p => p.channel === 'ANDROID_APK').length,
      gmailCdp: this.payments.filter(p => p.channel === 'GMAIL_CDP').length,
      manual: this.payments.filter(p => p.channel === 'MANUAL_OVERRIDE').length,
      cod: this.payments.filter(p => p.channel === 'CASH_DELIVERY').length
    };

    return {
      totalSettled,
      totalFeesSaved,
      successCount: successPayments.length,
      totalAttempts,
      successRate,
      avgDuration,
      channels
    };
  }

  exportPaymentsToCSV() {
    const headers = ["Payment ID", "Order ID", "Date", "Customer Name", "Phone", "Amount (INR)", "Fee Saved (INR)", "Mode", "VPA", "Bank UTR", "Observation Channel", "Status"];
    const rows = this.payments.map(p => [
      p.id,
      p.orderId,
      new Date(p.timestamp).toLocaleString('en-IN'),
      `"${p.customer?.name || 'Guest'}"`,
      p.customer?.phone || '',
      p.amountINR || 0,
      p.feeSavedINR || 0,
      p.paymentMode || 'UPI',
      p.upiVpa || '',
      `"${p.utr || ''}"`,
      p.channel || 'BANK_SMS',
      p.status || 'PENDING'
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Seed sample festival offerings for preview/testing on demand
  seedSampleFestiveCatalog() {
    this.products = FESTIVE_PRODUCTS.map(p => {
      const markupRatio = 1.25 + (Math.round((p.priceINR % 100)) / 400);
      const originalPriceINR = Math.round((p.priceINR * markupRatio) / 100) * 100 - 1;
      const discountPercent = Math.round(((originalPriceINR - p.priceINR) / originalPriceINR) * 100);
      const costPriceINR = Math.round(p.priceINR * 0.55);
      const festData = this.getDefaultFestival(p.id, p.category);

      return {
        ...p,
        originalPriceINR,
        costPriceINR,
        sku: `UB-${p.category.toUpperCase().slice(0, 4)}-${p.id.replace('ub-', '')}`,
        hsnCode: '7419',
        festival: festData.festival,
        festivalTag: festData.festivalTag,
        stockQty: 25,
        lowStockThreshold: 5,
        discountPercent,
        imageUrl: p.imageUrl || '',
        inStock: p.inStock !== false
      };
    });
    this.saveProductsToStorage();
    return [...this.products];
  }

  // Clear all products to make catalog 100% clean/empty
  clearAllProducts() {
    this.products = [];
    this.saveProductsToStorage();
    return [];
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.DISCOUNT_BAR);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.YOUPI_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STAKING);
    this.products = [];
    this.orders = [];
    this.payments = [];
    this.reviews = {};
    this.saveProductsToStorage();
  }
}

export const productStore = new ProductStore();
