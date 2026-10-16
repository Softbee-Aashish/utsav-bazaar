// Central Reactive Product, Pricing, Discount & Google Sheet Data Store
import { FESTIVE_PRODUCTS } from '../components/ProductData.js';

const STORAGE_KEYS = {
  PRODUCTS: 'utsav_products_v6',
  DISCOUNT_BAR: 'utsav_discount_bar_v6',
  GOOGLE_SHEET_URL: 'utsav_gsheet_url_v6',
  APPS_SCRIPT_URL: 'utsav_apps_script_url_v1',
  REVIEWS: 'utsav_product_reviews_v6',
  ORDERS: 'utsav_orders_v6'
};

export class ProductStore {
  constructor() {
    this.products = [];
    this.orders = [];
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
    // 1. Load Products
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        this.products = JSON.parse(saved);
        // Ensure all products have real imageUrl, stock count, SKU, and cost price backfilled
        let updated = false;
        FESTIVE_PRODUCTS.forEach(fp => {
          const existing = this.products.find(p => p.id === fp.id);
          if (!existing) {
            const markupRatio = 1.25 + (Math.round((fp.priceINR % 100)) / 400);
            const originalPriceINR = Math.round((fp.priceINR * markupRatio) / 100) * 100 - 1;
            const discountPercent = Math.round(((originalPriceINR - fp.priceINR) / originalPriceINR) * 100);
            const costPriceINR = Math.round(fp.priceINR * 0.55); // Estimated artisan manufacturing cost
            this.products.push({
              ...fp,
              originalPriceINR,
              costPriceINR,
              sku: `UB-${fp.category.toUpperCase().slice(0, 4)}-${fp.id.replace('ub-', '')}`,
              hsnCode: '7419', // Brass / Metal Handicrafts HSN
              stockQty: 25,
              lowStockThreshold: 5,
              discountPercent,
              imageUrl: fp.imageUrl || '',
              inStock: fp.inStock !== false
            });
            updated = true;
          } else {
            if (!existing.imageUrl || existing.imageUrl.trim() === '') {
              existing.imageUrl = fp.imageUrl;
              updated = true;
            }
            if (existing.stockQty === undefined) {
              existing.stockQty = 25;
              existing.lowStockThreshold = 5;
              existing.costPriceINR = Math.round(existing.priceINR * 0.55);
              existing.sku = `UB-${existing.category.toUpperCase().slice(0, 4)}-${existing.id.replace('ub-', '')}`;
              existing.hsnCode = '7419';
              updated = true;
            }
            if (!existing.festival) {
              const festData = this.getDefaultFestival(existing.id, existing.category);
              existing.festival = festData.festival;
              existing.festivalTag = festData.festivalTag;
              updated = true;
            }
          }
        });
        if (updated) this.saveProductsToStorage();
      } else {
        // Seed initial products with original marked prices, costs, SKU, & discounts
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
      }
    } catch (e) {
      console.warn("Could not load products from storage", e);
      this.products = [...FESTIVE_PRODUCTS];
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
      if (savedUrl) this.googleSheetUrl = savedUrl;
    } catch (e) {}

    // 4. Load Custom Reviews
    try {
      const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (savedReviews) {
        this.reviews = JSON.parse(savedReviews);
        if (this.reviews["ub-001"] && (!this.reviews["ub-001"][0].avatarUrl || !this.reviews["ub-001"][0].photoUrl)) {
          this.seedInitialReviews();
        }
      } else {
        this.seedInitialReviews();
      }
    } catch (e) {
      this.seedInitialReviews();
    }

    // 5. Load Merchant Orders Pipeline
    try {
      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        this.orders = JSON.parse(savedOrders);
      } else {
        this.seedInitialOrders();
      }
    } catch (e) {
      this.seedInitialOrders();
    }
  }

  seedInitialOrders() {
    this.orders = [
      {
        id: "UB-ORD-849102",
        invoiceNumber: "UB-INV-2026-881204",
        date: "14 Oct 2026",
        timestamp: Date.now() - 3600000 * 3,
        customer: {
          name: "Aarav Sharma",
          email: "aarav.sharma@utsavbazaar.in",
          phone: "+91 98765 43210",
          address: "House 14, Royal Courtyard, M.G. Road",
          city: "Jaipur",
          pincode: "302001"
        },
        items: [
          { id: "ub-001", name: "Moradabad Mayur Solid Brass Diya", category: "diyas", priceINR: 2499, quantity: 1, subtotalINR: 2499 },
          { id: "ub-007", name: "Mangalya Auspicious Velvet Zardozi Toran", category: "torans", priceINR: 2499, quantity: 1, subtotalINR: 2499 }
        ],
        subtotalINR: 4998,
        discountINR: 0,
        taxINR: 0,
        totalINR: 4998,
        paymentMode: "UPI Instant (PhonePe / GPay)",
        paymentStatus: "Paid (Verified)",
        orderStatus: "Processing",
        trackingNumber: "UB-TRK-771822"
      },
      {
        id: "UB-ORD-771249",
        invoiceNumber: "UB-INV-2026-641920",
        date: "13 Oct 2026",
        timestamp: Date.now() - 3600000 * 26,
        customer: {
          name: "Meera Rajput",
          email: "meera.rajput@festiveluxury.in",
          phone: "+91 98201 12345",
          address: "Flat 12B, Samudra Mahal, Worli Sea Face",
          city: "Mumbai",
          pincode: "400018"
        },
        items: [
          { id: "ub-009", name: "Shahi Benarasi Raw Silk Kurta & Stole", category: "apparel", priceINR: 4699, quantity: 1, subtotalINR: 4699 },
          { id: "ub-006", name: "Nandini Hand-Hammered Brass Lotus Urli", category: "decor", priceINR: 3499, quantity: 1, subtotalINR: 3499 }
        ],
        subtotalINR: 8198,
        discountINR: 819.8,
        taxINR: 0,
        totalINR: 7378,
        paymentMode: "Credit Card (HDFC Regalia)",
        paymentStatus: "Paid (Verified)",
        orderStatus: "Dispatched",
        trackingNumber: "UB-TRK-992140"
      },
      {
        id: "UB-ORD-652391",
        invoiceNumber: "UB-INV-2026-442819",
        date: "12 Oct 2026",
        timestamp: Date.now() - 3600000 * 52,
        customer: {
          name: "Vikramaditya Singhania",
          email: "vikram.singh@heritageart.org",
          phone: "+91 97112 34567",
          address: "B-4/22 Safdarjung Enclave",
          city: "New Delhi",
          pincode: "110029"
        },
        items: [
          { id: "ub-003", name: "Royal Noor Jali Brass Lantern", category: "lanterns", priceINR: 3499, quantity: 2, subtotalINR: 6998 },
          { id: "ub-010", name: "Noor-e-Chanderi Handloom Zari Silk Dupatta & Kurta", category: "apparel", priceINR: 4299, quantity: 1, subtotalINR: 4299 }
        ],
        subtotalINR: 11297,
        discountINR: 1694.55,
        taxINR: 0,
        totalINR: 9602,
        paymentMode: "Net Banking (SBI)",
        paymentStatus: "Paid (Verified)",
        orderStatus: "Out for Delivery",
        trackingNumber: "UB-TRK-883912"
      },
      {
        id: "UB-ORD-519280",
        invoiceNumber: "UB-INV-2026-311029",
        date: "10 Oct 2026",
        timestamp: Date.now() - 3600000 * 98,
        customer: {
          name: "Ananya Roy",
          email: "ananya.roy@royalbengal.co.in",
          phone: "+91 94330 98765",
          address: "7A Southern Avenue, Keyatala",
          city: "Kolkata",
          pincode: "700029"
        },
        items: [
          { id: "ub-008", name: "Aakash Deepam Hanging Diya", category: "diyas", priceINR: 1999, quantity: 1, subtotalINR: 1999 },
          { id: "ub-004", name: "Maha Lakshmi Temple Bell", category: "diyas", priceINR: 1199, quantity: 1, subtotalINR: 1199 }
        ],
        subtotalINR: 3198,
        discountINR: 0,
        taxINR: 0,
        totalINR: 3198,
        paymentMode: "Cash on Delivery (COD)",
        paymentStatus: "Paid (COD Collected)",
        orderStatus: "Delivered",
        trackingNumber: "UB-TRK-554190"
      }
    ];
    this.saveOrdersToStorage();
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

    const processingCount = this.orders.filter(o => o.orderStatus === 'Processing').length;
    const dispatchedCount = this.orders.filter(o => o.orderStatus === 'Dispatched').length;
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
      processingCount,
      dispatchedCount,
      outForDeliveryCount,
      deliveredCount,
      cancelledCount,
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

  seedInitialReviews() {
    this.reviews = {
      "ub-001": [
        {
          id: "rev-1",
          name: "Sunita Deshmukh",
          city: "Mumbai, Maharashtra",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
          photoUrl: "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=600&q=80",
          rating: 5,
          title: "Magnificent Moradabad brass finish!",
          date: "12 Oct 2026",
          comment: "The Moradabad brass finish is truly magnificent. The diya burned all through Diwali night without dripping once!",
          verified: true
        },
        {
          id: "rev-2",
          name: "Rajesh Kulkarni",
          city: "Pune, Maharashtra",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
          photoUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80",
          rating: 5,
          title: "Heavier than expected, pure solid brass",
          date: "08 Oct 2026",
          comment: "Heavier than expected! Pure solid virgin brass with exquisite peacock engraving. Worth every rupee.",
          verified: true
        }
      ],
      "ub-007": [
        {
          id: "rev-3",
          name: "Anil Singhania",
          city: "New Delhi",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
          photoUrl: "https://images.unsplash.com/photo-1514517521153-1be72277b32f?auto=format&fit=crop&w=600&q=80",
          rating: 5,
          title: "Melodic ghungroo chimes and rich zardozi",
          date: "14 Oct 2026",
          comment: "The velvet zardozi work on this door toran is breathtaking! The brass ghungroos make a melodic chime when opening the door.",
          verified: true
        },
        {
          id: "rev-4",
          name: "Pooja Malhotra",
          city: "Jaipur, Rajasthan",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
          photoUrl: "",
          rating: 5,
          title: "Elevated our courtyard entrance",
          date: "11 Oct 2026",
          comment: "Completely elevated our courtyard entrance. All our guests complimented the auspicious Shubh-Labh embroidery!",
          verified: true
        }
      ],
      "ub-006": [
        {
          id: "rev-5",
          name: "Devendra Swaminathan",
          city: "Chennai, Tamil Nadu",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
          photoUrl: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80",
          rating: 5,
          title: "The hand-hammered petals are mesmerizing",
          date: "15 Oct 2026",
          comment: "Filled this brass lotus urli with fresh marigolds and floating tealights for Navratri. The reflections are magical!",
          verified: true
        }
      ]
    };
    this.saveReviewsToStorage();
  }

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
      localStorage.setItem(STORAGE_KEYS.DISCOUNT_BAR, JSON.stringify(this.discountSettings));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('discount-bar-updated', { detail: this.discountSettings }));
  }

  saveReviewsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(this.reviews));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('reviews-updated'));
  }

  notifyUpdate() {
    window.dispatchEvent(new CustomEvent('products-updated', { detail: { products: this.products } }));
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

      const headers = lines[0].map(h => h.trim().toLowerCase());
      const idIdx = headers.indexOf("id");
      const nameIdx = headers.indexOf("name");
      const catIdx = headers.indexOf("category");
      const priceIdx = headers.indexOf("priceinr");
      const origPriceIdx = headers.indexOf("originalpriceinr");
      const discIdx = headers.indexOf("discountpercent");
      const imgIdx = headers.indexOf("imageurl");
      const originIdx = headers.indexOf("origin");
      const badgeIdx = headers.indexOf("badge");
      const tagIdx = headers.indexOf("tagline");
      const descIdx = headers.indexOf("description");
      const stockIdx = headers.indexOf("instock");

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
        const category = (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim().toLowerCase() : 'fireworks';
        const priceINR = parseFloat(row[priceIdx]) || 999;
        const originalPriceINR = (origPriceIdx !== -1 && parseFloat(row[origPriceIdx])) || Math.round(priceINR * 1.25);
        const discountPercent = (discIdx !== -1 && parseFloat(row[discIdx])) || Math.round(((originalPriceINR - priceINR) / originalPriceINR) * 100);
        const imageUrl = (imgIdx !== -1 && row[imgIdx]) ? row[imgIdx].trim() : '';
        const origin = (originIdx !== -1 && row[originIdx]) ? row[originIdx].trim() : 'India';
        const badge = (badgeIdx !== -1 && row[badgeIdx]) ? row[badgeIdx].trim() : 'Diwali Special';
        const tagline = (tagIdx !== -1 && row[tagIdx]) ? row[tagIdx].trim() : 'Handcrafted Festive Essential';
        const description = (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : 'Blessed festive offering.';
        const inStock = stockIdx !== -1 ? (row[stockIdx].trim().toUpperCase() !== 'FALSE') : true;

        // Preserve existing icon or fallback
        const existing = this.getProductById(id);
        const svgIcon = existing ? existing.svgIcon : (category === 'diyas' ? 'diya' : 'decor');
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
          imageUrl,
          tagline,
          description,
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
    const targetUrl = url || this.googleSheetUrl;
    if (!targetUrl) throw new Error("No Google Sheet Published CSV URL provided.");

    this.googleSheetUrl = targetUrl;
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEET_URL, targetUrl);

    // Fetch the published CSV directly
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error(`Failed to fetch from Google Sheet (HTTP ${res.status}). Verify sheet is Published to Web as CSV.`);
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

  getCategoryDisplayName(cat) {
    switch (cat) {
      case 'diyas': return 'Royal Diyas & Brass';
      case 'apparel': return 'Royal Silk & Attire';
      case 'torans': return 'Torans & Wall Hangings';
      case 'decor': return 'Royal Urlis & Home Decor';
      case 'hampers': return 'Festive Hampers';
      case 'lanterns': return 'Lanterns & Decor';
      case 'heirlooms': return 'Artisanal Heirlooms';
      default: return 'Festive Home Decor';
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

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.DISCOUNT_BAR);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    this.init();
  }
}

export const productStore = new ProductStore();
