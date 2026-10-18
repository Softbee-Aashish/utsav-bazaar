// Modern Storefront Showcase & Catalog Grid ("e-com mart")
import { productStore } from '../engine/ProductStore.js';

export class ShopSection {
  constructor(container, onAddToCart, onQuickView) {
    this.container = container;
    this.onAddToCart = onAddToCart;
    this.onQuickView = onQuickView;
    this.activeCategory = 'all';
    this.currentCurrency = 'INR';

    this.render();
    this.bindEvents();
    this.listenToStoreUpdates();
  }

  listenToStoreUpdates() {
    window.addEventListener('products-updated', () => {
      this.render();
      this.bindEvents();
    });
    window.addEventListener('supabase-synced', () => {
      this.render();
      this.bindEvents();
    });
  }

  render() {
    const products = productStore.getProducts();
    const featured = products.find(p => p.featured) || products[0] || null;
    const featuredId = featured ? featured.id : '';
    const featuredTitle = featured ? featured.name : 'AuraPro Wireless Noise-Cancelling Headphones';
    const featuredDesc = featured ? (featured.description || 'Premium audio engineering with active noise cancellation.') : 'Engineered for immersive acoustic depth, 40mm titanium drivers, and 40-hour battery standby.';
    const categories = productStore.getActiveCategories();

    this.container.innerHTML = `
      <section class="ecom-storefront" id="ecom-storefront">
        <!-- Modern Hero Banner -->
        <div class="storefront-hero">
          <div class="hero-pre-title">
            <span class="hero-pulse-dot"></span>
            <span>VERIFIED QUALITY • CLOUD-SYNCED CATALOG</span>
          </div>
          <h1 class="storefront-hero-title">Curated Essentials for Modern Living</h1>
          <p class="storefront-hero-sub">
            Discover top-rated wireless electronics, tailored organic apparel, minimalist home aesthetics, and precision daily stationery delivered straight to your door.
          </p>

          <!-- Spotlight Product Banner -->
          ${featured ? `
            <div class="hero-spotlight-banner">
              <div class="spotlight-left">
                <img src="${featured.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}" class="spotlight-thumb" alt="${featuredTitle}" />
                <div class="spotlight-text">
                  <span class="spotlight-badge">FEATURED PICK</span>
                  <h3 class="spotlight-name">${featuredTitle}</h3>
                  <p class="spotlight-desc">${featuredDesc}</p>
                </div>
              </div>
              <button class="btn-spotlight-cta" data-action="quickview" data-id="${featuredId}">
                <span>Quick View</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
          ` : ''}

          <!-- 4 Modern Value Pillars -->
          <div class="storefront-pillars-grid">
            <div class="pillar-card">
              <span class="pillar-icon">⚡</span>
              <div class="pillar-info">
                <strong>Express Dispatch</strong>
                <span>24-48h pan-India delivery</span>
              </div>
            </div>
            <div class="pillar-card">
              <span class="pillar-icon">🛡️</span>
              <div class="pillar-info">
                <strong>100% Authentic</strong>
                <span>Direct brand verified items</span>
              </div>
            </div>
            <div class="pillar-card">
              <span class="pillar-icon">🔒</span>
              <div class="pillar-info">
                <strong>Secure Checkout</strong>
                <span>256-bit encrypted UPI & Cards</span>
              </div>
            </div>
            <div class="pillar-card">
              <span class="pillar-icon">📦</span>
              <div class="pillar-info">
                <strong>7-Day Returns</strong>
                <span>Easy doorstep replacements</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Category Filter Bar -->
          <div class="category-filter-bar">
            <button class="cat-filter-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-category="all">
              All Products
            </button>
            ${categories.map(cat => `
              <button class="cat-filter-btn ${this.activeCategory === cat.key ? 'active' : ''}" data-category="${cat.key}">
                ${cat.name} (${cat.count})
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Products Catalog Grid -->
        <div class="product-catalog-grid" id="product-grid">
          ${this.renderProductCards()}
        </div>

        <!-- Store Trust Promise Section -->
        <div class="modern-trust-section">
          <div class="trust-content">
            <span class="trust-kicker">BUILT FOR EVERYDAY VALUE</span>
            <h3 class="trust-headline">Fast, Transparent & Reliable E-Commerce</h3>
            <p class="trust-body">
              Every order placed on e-com mart is backed by automated inventory synchronization, transparent all-inclusive pricing, zero hidden taxes, and high-speed parcel tracking.
            </p>
            <div class="trust-stats-row">
              <div class="stat-box">
                <strong>100%</strong>
                <span>Quality Tested</span>
              </div>
              <div class="stat-box">
                <strong>4.9 ★</strong>
                <span>Customer Satisfaction</span>
              </div>
              <div class="stat-box">
                <strong>24/7</strong>
                <span>Support Team</span>
              </div>
              <div class="stat-box">
                <strong>0%</strong>
                <span>Hidden Fees</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  renderProductCards() {
    const allProducts = productStore.getProducts();
    const filtered = this.activeCategory === 'all'
      ? allProducts
      : allProducts.filter(p => (p.category || '').toLowerCase() === this.activeCategory.toLowerCase());

    if (filtered.length === 0) {
      return `
        <div class="empty-catalog-card" style="grid-column: 1 / -1; text-align: center; padding: 48px; background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(148,163,184,0.3); border-radius: 16px;">
          <span style="font-size: 38px; display: block; margin-bottom: 12px;">📦</span>
          <h3 style="margin: 0 0 8px; font-size: 18px;">No Products Found in This Category</h3>
          <p style="color: #94A3B8; font-size: 14px; margin: 0 0 20px;">Use the Admin Suite to add products to your Supabase cloud catalog.</p>
          <a href="#/admin/products" class="btn-spotlight-cta" style="display: inline-flex; text-decoration: none;">Open Admin Catalog</a>
        </div>
      `;
    }

    return filtered.map(p => `
      <div class="ecom-product-card" data-id="${p.id}">
        <div class="card-image-box">
          <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}" alt="${p.name}" class="card-img" loading="lazy" />
          <span class="card-cat-badge">${p.categoryName || p.category}</span>
          ${p.featured ? '<span class="card-feat-badge">Bestseller</span>' : ''}
        </div>

        <div class="card-content-box">
          <div class="card-rating-row">
            <span class="rating-stars">★★★★★</span>
            <span class="rating-val">4.8</span>
            <span class="rating-reviews">(24)</span>
          </div>

          <h4 class="card-title">
            <a href="#/product/${p.id}" class="card-title-link">${p.name}</a>
          </h4>

          <p class="card-short-desc">${p.description ? p.description.slice(0, 95) + '...' : ''}</p>

          <div class="card-pricing-row">
            <div class="pricing-left">
              <span class="price-current">₹${(p.priceINR || 0).toLocaleString('en-IN')}</span>
              <span class="price-original">₹${Math.round((p.priceINR || 0) * 1.3).toLocaleString('en-IN')}</span>
              <span class="price-discount">23% OFF</span>
            </div>
            <span class="stock-status-pill ${(p.stockQty || 0) > 0 ? 'in' : 'out'}">
              ${(p.stockQty || 0) > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div class="card-buttons-row">
            <button class="btn-card-quickview" data-action="quickview" data-id="${p.id}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Quick View</span>
            </button>
            <button class="btn-card-add" data-action="add-cart" data-id="${p.id}" ${(p.stockQty || 0) <= 0 ? 'disabled' : ''}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Category filter pills
    this.container.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.onclick = () => {
        this.activeCategory = btn.getAttribute('data-category');
        this.container.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const grid = this.container.querySelector('#product-grid');
        if (grid) grid.innerHTML = this.renderProductCards();
        this.bindCardActions();
      };
    });

    this.bindCardActions();
  }

  bindCardActions() {
    // Quick View buttons
    this.container.querySelectorAll('[data-action="quickview"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const prod = productStore.getProductById(id);
        if (prod && this.onQuickView) {
          this.onQuickView(prod);
        }
      };
    });

    // Add to Cart buttons
    this.container.querySelectorAll('[data-action="add-cart"]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        const prod = productStore.getProductById(id);
        if (prod && this.onAddToCart) {
          this.onAddToCart(prod);
          btn.innerText = 'Added! ✓';
          setTimeout(() => {
            btn.innerHTML = `
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span>Add to Cart</span>
            `;
          }, 1200);
        }
      };
    });
  }
}
