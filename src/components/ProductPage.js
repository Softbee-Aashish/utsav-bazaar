// Flipkart / Amazon E-Commerce Product Listing & Full Product Detail Page Component
import { productStore } from '../engine/ProductStore.js';

export class ProductPage {
  constructor(container, onAddToCart, onBuyNow) {
    this.container = container;
    this.onAddToCart = onAddToCart;
    this.onBuyNow = onBuyNow;
    this.currentCurrency = 'INR';
    this.selectedCategory = 'all';
    this.priceFilter = 'all';
    this.ratingFilter = 0;
    this.discountFilter50 = false;
    this.stockOnly = false;
    this.searchQuery = '';
    this.sortOption = 'featured';
    this.activeProductId = null;
    this.selectedImageIdx = 0;
    this.selectedQuantity = 1;
    this.wishlist = new Set(JSON.parse(localStorage.getItem('utsav_wishlist') || '[]'));

    this.init();
  }

  isWishlisted(id) {
    return this.wishlist.has(id);
  }

  toggleWishlist(id) {
    if (this.wishlist.has(id)) {
      this.wishlist.delete(id);
    } else {
      this.wishlist.add(id);
    }
    try {
      localStorage.setItem('utsav_wishlist', JSON.stringify(Array.from(this.wishlist)));
    } catch (e) {}
  }

  init() {
    this.render();
    this.bindEvents();

    window.addEventListener('currency-changed', (e) => {
      this.currentCurrency = e.detail.currency;
      if (this.activeProductId) {
        this.renderProductDetail(this.activeProductId);
      } else {
        this.renderCatalogList();
      }
    });

    window.addEventListener('products-updated', () => {
      if (this.activeProductId) {
        this.renderProductDetail(this.activeProductId);
      } else {
        this.updateCategoriesUI();
        this.renderCatalogList();
      }
    });

    window.addEventListener('reviews-updated', () => {
      if (this.activeProductId) {
        this.renderProductDetail(this.activeProductId);
      } else {
        this.renderCatalogList();
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <section class="ecom-product-page-wrapper" id="ecom-product-page-wrapper" style="display: none;">
        <div class="ecom-inner-container" id="ecom-main-content">
          <!-- Dynamically switched between Catalog Listing and Product Detail View -->
        </div>
      </section>
    `;
  }

  showListing(category = 'all', searchQuery = '', syncHash = true) {
    this.activeProductId = null;
    this.selectedCategory = category;
    this.searchQuery = searchQuery || '';
    const wrapper = this.container.querySelector('#ecom-product-page-wrapper');
    if (wrapper) wrapper.style.display = 'block';

    if (syncHash) {
      const hashStr = category && category !== 'all' ? `#/products/${category}` : '#/products';
      if (window.location.hash !== hashStr) {
        history.pushState(null, '', hashStr);
      }
    }

    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!mainContent) return;

    const activeCategories = productStore.getActiveCategories();

    mainContent.innerHTML = `
      <!-- 1. Top Flipkart / Amazon Mobile Header (Screenshot 1) -->
      <header class="ecom-mobile-top-header">
        <button class="m-back-btn" id="btn-mobile-header-back" aria-label="Go Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="m-logo-brand" id="mobile-brand-home-trigger" title="e-com mart Home">
          <span class="brand-leaf-dot"></span>
        </div>
        <div class="m-search-box">
          <span class="m-search-glass-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input type="text" id="mobile-ecom-search-input" placeholder="Search for products" value="${this.searchQuery}" />
          ${this.searchQuery ? `<button class="m-search-clear-btn" id="btn-m-search-clear">✕</button>` : ''}
        </div>
        <button class="m-header-cart-icon" id="btn-mobile-header-cart" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </button>
      </header>

      <!-- 2. Mobile Split Sort / Filter Bar (Screenshot 1) -->
      <div class="ecom-mobile-subbar">
        <button class="m-subbar-btn" id="btn-open-m-sort">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
          <span>Sort</span>
        </button>
        <div class="m-subbar-sep"></div>
        <button class="m-subbar-btn" id="btn-open-m-filter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></svg>
          <span>Filter</span>
        </button>
      </div>

      <!-- 3. Mobile Horizontal Filter Chips Rail (Screenshot 1) -->
      <div class="ecom-mobile-chips-bar">
        <div class="m-chips-rail" id="mobile-chips-track">
          <button class="m-chip ${this.selectedCategory === 'all' && this.priceFilter === 'all' && !this.discountFilter50 && !this.stockOnly ? 'active' : ''}" data-chip="all">
            <span class="m-chip-icon">🏷️</span>
            <span>All</span>
          </button>
          <button class="m-chip ${this.discountFilter50 ? 'active' : ''}" data-chip="discount50">
            <span class="m-chip-icon">🈹</span>
            <span>50% or more</span>
          </button>
          ${activeCategories.map(cat => `
            <button class="m-chip ${this.selectedCategory === cat.key ? 'active' : ''}" data-chip="${cat.key}">
              <span class="m-chip-icon">✨</span>
              <span>${cat.name}</span>
            </button>
          `).join('')}
          <button class="m-chip ${this.priceFilter === 'under2000' ? 'active' : ''}" data-chip="under2000">
            <span class="m-chip-icon">⚡</span>
            <span>Under ₹2000</span>
          </button>
          <button class="m-chip ${this.ratingFilter >= 4.5 ? 'active' : ''}" data-chip="rating45">
            <span class="m-chip-icon">★</span>
            <span>4.5 & up</span>
          </button>
          <button class="m-chip ${this.stockOnly ? 'active' : ''}" data-chip="stock">
            <span class="m-chip-icon">📦</span>
            <span>In Stock</span>
          </button>
        </div>
      </div>

      <!-- Desktop Breadcrumb & Sort Bar (Hidden on Mobile) -->
      <div class="ecom-results-header">
        <div class="ecom-breadcrumb">
          <a href="#" class="breadcrumb-home-link" id="ecom-crumb-home">Home</a>
          <span class="crumb-sep">›</span>
          <span class="crumb-current">All Festive Products</span>
          ${this.selectedCategory !== 'all' ? `<span class="crumb-sep">›</span><span class="crumb-tag">${this.getCategoryName(this.selectedCategory)}</span>` : ''}
        </div>
        <div class="ecom-sort-bar">
          <span class="results-count" id="results-count-text">Showing offerings...</span>
          <div class="sort-selector-wrapper">
            <label for="ecom-sort-select">Sort by:</label>
            <select id="ecom-sort-select" class="ecom-select">
              <option value="featured" ${this.sortOption === 'featured' ? 'selected' : ''}>Featured</option>
              <option value="price-low" ${this.sortOption === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
              <option value="price-high" ${this.sortOption === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              <option value="rating" ${this.sortOption === 'rating' ? 'selected' : ''}>Customer Rating</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Layout: Sidebar Filters + Products Grid -->
      <div class="ecom-layout-grid">
        <!-- Left Sidebar Filter (Desktop layout) -->
        <aside class="ecom-filter-sidebar">
          <div class="filter-group">
            <h4 class="filter-title">Category</h4>
            <ul class="filter-list">
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="all" ${this.selectedCategory === 'all' ? 'checked' : ''} /> <span>All Categories</span></label></li>
              ${activeCategories.length === 0 ? `
                <li style="padding: 6px 0; font-size: 12px; color: #888;">No active categories yet</li>
              ` : activeCategories.map(cat => `
                <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="${cat.key}" ${this.selectedCategory === cat.key ? 'checked' : ''} /> <span>${cat.name} (${cat.count})</span></label></li>
              `).join('')}
            </ul>
          </div>

          <div class="filter-divider"></div>

          <div class="filter-group">
            <h4 class="filter-title">Price</h4>
            <ul class="filter-list">
              <li><label class="filter-radio"><input type="radio" name="ecom-price" value="all" ${this.priceFilter === 'all' ? 'checked' : ''} /> <span>All Prices</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-price" value="under2000" ${this.priceFilter === 'under2000' ? 'checked' : ''} /> <span>Under ₹2,000</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-price" value="2000-4000" ${this.priceFilter === '2000-4000' ? 'checked' : ''} /> <span>₹2,000 - ₹4,000</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-price" value="above4000" ${this.priceFilter === 'above4000' ? 'checked' : ''} /> <span>Over ₹4,000</span></label></li>
            </ul>
          </div>

          <div class="filter-divider"></div>

          <div class="filter-group">
            <h4 class="filter-title">Customer Review</h4>
            <ul class="filter-list">
              <li><label class="filter-radio"><input type="radio" name="ecom-rating" value="0" ${this.ratingFilter === 0 ? 'checked' : ''} /> <span>All Reviews</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-rating" value="4.8" ${this.ratingFilter === 4.8 ? 'checked' : ''} /> <span>★★★★★ 4.8 & up</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-rating" value="4.5" ${this.ratingFilter === 4.5 ? 'checked' : ''} /> <span>★★★★☆ 4.5 & up</span></label></li>
            </ul>
          </div>

          <div class="filter-divider"></div>

          <div class="filter-group">
            <h4 class="filter-title">Availability</h4>
            <label class="filter-checkbox">
              <input type="checkbox" id="ecom-stock-check" ${this.stockOnly ? 'checked' : ''} />
              <span>In Stock Only</span>
            </label>
          </div>

          <div class="filter-divider"></div>

          <div class="filter-group">
            <h4 class="filter-title">Special Benefits</h4>
            <div class="prime-festive-badge">
              <span class="gold-icon">👑</span>
              <span>Express Delivery</span>
            </div>
            <div class="filter-feature-note">Free Premium Gift Packaging & Insured Delivery with every order.</div>
          </div>
        </aside>

        <!-- Right Product Cards Grid (Flipkart / Amazon card format - Strictly 2 columns on mobile) -->
        <main class="ecom-cards-stream" id="ecom-cards-stream">
          <!-- Filled by renderCatalogList() -->
        </main>
      </div>

      <!-- Mobile Sort Bottom Sheet Modal -->
      <div class="mobile-bottomsheet-backdrop" id="m-sort-backdrop"></div>
      <div class="mobile-bottomsheet" id="m-sort-sheet">
        <div class="bottomsheet-header">
          <h3>Sort By</h3>
          <button class="bottomsheet-close-btn" id="btn-close-sort-sheet">✕</button>
        </div>
        <div class="bottomsheet-body">
          <label class="sheet-radio-row">
            <input type="radio" name="m-sort-radio" value="featured" ${this.sortOption === 'featured' ? 'checked' : ''} />
            <span>Featured / Popularity</span>
          </label>
          <label class="sheet-radio-row">
            <input type="radio" name="m-sort-radio" value="price-low" ${this.sortOption === 'price-low' ? 'checked' : ''} />
            <span>Price -- Low to High</span>
          </label>
          <label class="sheet-radio-row">
            <input type="radio" name="m-sort-radio" value="price-high" ${this.sortOption === 'price-high' ? 'checked' : ''} />
            <span>Price -- High to Low</span>
          </label>
          <label class="sheet-radio-row">
            <input type="radio" name="m-sort-radio" value="rating" ${this.sortOption === 'rating' ? 'checked' : ''} />
            <span>Customer Rating</span>
          </label>
        </div>
      </div>

      <!-- Mobile Filter Bottom Sheet Modal -->
      <div class="mobile-bottomsheet-backdrop" id="m-filter-backdrop"></div>
      <div class="mobile-bottomsheet" id="m-filter-sheet">
        <div class="bottomsheet-header">
          <h3>Filters</h3>
          <button class="bottomsheet-clear-link" id="btn-sheet-clear-filters">Clear All</button>
          <button class="bottomsheet-close-btn" id="btn-close-filter-sheet">✕</button>
        </div>
        <div class="bottomsheet-body filter-scrollable">
          <div class="sheet-filter-section">
            <h4>Category</h4>
            <div class="sheet-options-grid">
              <label class="sheet-pill-label"><input type="radio" name="m-sheet-cat" value="all" ${this.selectedCategory === 'all' ? 'checked' : ''} /> <span>All</span></label>
              ${activeCategories.map(cat => `
                <label class="sheet-pill-label"><input type="radio" name="m-sheet-cat" value="${cat.key}" ${this.selectedCategory === cat.key ? 'checked' : ''} /> <span>${cat.name}</span></label>
              `).join('')}
            </div>
          </div>
          <div class="sheet-filter-section">
            <h4>Price Range</h4>
            <div class="sheet-options-grid">
              <label class="sheet-pill-label"><input type="radio" name="m-sheet-price" value="all" ${this.priceFilter === 'all' ? 'checked' : ''} /> <span>All Prices</span></label>
              <label class="sheet-pill-label"><input type="radio" name="m-sheet-price" value="under2000" ${this.priceFilter === 'under2000' ? 'checked' : ''} /> <span>Under ₹2,000</span></label>
              <label class="sheet-pill-label"><input type="radio" name="m-sheet-price" value="2000-4000" ${this.priceFilter === '2000-4000' ? 'checked' : ''} /> <span>₹2,000 - ₹4,000</span></label>
              <label class="sheet-pill-label"><input type="radio" name="m-sheet-price" value="above4000" ${this.priceFilter === 'above4000' ? 'checked' : ''} /> <span>Over ₹4,000</span></label>
            </div>
          </div>
          <div class="sheet-filter-section">
            <h4>Special Discount</h4>
            <label class="sheet-checkbox-row">
              <input type="checkbox" id="m-sheet-disc50" ${this.discountFilter50 ? 'checked' : ''} />
              <span>50% or More Festive Discount</span>
            </label>
          </div>
          <div class="sheet-filter-section">
            <h4>Availability</h4>
            <label class="sheet-checkbox-row">
              <input type="checkbox" id="m-sheet-stock" ${this.stockOnly ? 'checked' : ''} />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>
        <div class="bottomsheet-footer">
          <button class="sheet-apply-btn" id="btn-sheet-apply-filters">Apply Filters</button>
        </div>
      </div>
    `;

    this.renderCatalogList();
    this.bindListingEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateCategoriesUI() {
    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!mainContent || this.activeProductId) return;

    const activeCategories = productStore.getActiveCategories();

    // 1. Update Mobile Chips Rail
    const chipsTrack = mainContent.querySelector('#mobile-chips-track');
    if (chipsTrack) {
      chipsTrack.innerHTML = `
        <button class="m-chip ${this.selectedCategory === 'all' && this.priceFilter === 'all' && !this.discountFilter50 && !this.stockOnly ? 'active' : ''}" data-chip="all">
          <span class="m-chip-icon">🏷️</span>
          <span>All</span>
        </button>
        <button class="m-chip ${this.discountFilter50 ? 'active' : ''}" data-chip="discount50">
          <span class="m-chip-icon">🈹</span>
          <span>50% or more</span>
        </button>
        ${activeCategories.map(cat => `
          <button class="m-chip ${this.selectedCategory === cat.key ? 'active' : ''}" data-chip="${cat.key}">
            <span class="m-chip-icon">✨</span>
            <span>${cat.name}</span>
          </button>
        `).join('')}
        <button class="m-chip ${this.priceFilter === 'under2000' ? 'active' : ''}" data-chip="under2000">
          <span class="m-chip-icon">⚡</span>
          <span>Under ₹2000</span>
        </button>
        <button class="m-chip ${this.ratingFilter >= 4.5 ? 'active' : ''}" data-chip="rating45">
          <span class="m-chip-icon">★</span>
          <span>4.5 & up</span>
        </button>
        <button class="m-chip ${this.stockOnly ? 'active' : ''}" data-chip="stock">
          <span class="m-chip-icon">📦</span>
          <span>In Stock</span>
        </button>
      `;

      chipsTrack.querySelectorAll('.m-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const type = chip.getAttribute('data-chip');
          if (type === 'all') {
            this.selectedCategory = 'all';
            this.priceFilter = 'all';
            this.ratingFilter = 0;
            this.discountFilter50 = false;
            this.stockOnly = false;
          } else if (type === 'discount50') {
            this.discountFilter50 = !this.discountFilter50;
          } else if (type === 'under2000') {
            this.priceFilter = this.priceFilter === 'under2000' ? 'all' : 'under2000';
          } else if (type === 'rating45') {
            this.ratingFilter = this.ratingFilter >= 4.5 ? 0 : 4.5;
          } else if (type === 'stock') {
            this.stockOnly = !this.stockOnly;
          } else {
            this.selectedCategory = this.selectedCategory === type ? 'all' : type;
          }
          this.updateCategoriesUI();
          this.renderCatalogList();
        });
      });
    }

    // 2. Update Desktop Sidebar Category Radios
    const sidebarCatList = mainContent.querySelector('.ecom-filter-sidebar .filter-list');
    if (sidebarCatList) {
      sidebarCatList.innerHTML = `
        <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="all" ${this.selectedCategory === 'all' ? 'checked' : ''} /> <span>All Categories</span></label></li>
        ${activeCategories.length === 0 ? `
          <li style="padding: 6px 0; font-size: 12px; color: #888;">No active categories yet</li>
        ` : activeCategories.map(cat => `
          <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="${cat.key}" ${this.selectedCategory === cat.key ? 'checked' : ''} /> <span>${cat.name} (${cat.count})</span></label></li>
        `).join('')}
      `;
      sidebarCatList.querySelectorAll('input[name="ecom-cat"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
          this.selectedCategory = e.target.value;
          this.updateCategoriesUI();
          this.renderCatalogList();
        });
      });
    }

    // 3. Update Mobile Bottom Sheet Category Pills
    const sheetCatGrid = mainContent.querySelector('#m-filter-category-pills');
    if (sheetCatGrid) {
      sheetCatGrid.innerHTML = `
        <label class="sheet-pill-label">
          <input type="radio" name="m-filter-cat" value="all" ${this.selectedCategory === 'all' ? 'checked' : ''} />
          <span>All</span>
        </label>
        ${activeCategories.map(cat => `
          <label class="sheet-pill-label">
            <input type="radio" name="m-filter-cat" value="${cat.key}" ${this.selectedCategory === cat.key ? 'checked' : ''} />
            <span>${cat.name}</span>
          </label>
        `).join('')}
      `;
    }
  }

  renderCatalogList() {
    const stream = this.container.querySelector('#ecom-cards-stream');
    const countEl = this.container.querySelector('#results-count-text');
    if (!stream) return;

    let list = productStore.getProducts();

    // 1. Category filter
    if (this.selectedCategory !== 'all') {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    // 2. Search query filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.tagline && p.tagline.toLowerCase().includes(q)) || (p.origin && p.origin.toLowerCase().includes(q)));
    }

    // 3. Price filter
    if (this.priceFilter === 'under2000') {
      list = list.filter(p => p.priceINR < 2000);
    } else if (this.priceFilter === '2000-4000') {
      list = list.filter(p => p.priceINR >= 2000 && p.priceINR <= 4000);
    } else if (this.priceFilter === 'above4000') {
      list = list.filter(p => p.priceINR > 4000);
    }

    // 4. Rating filter
    if (this.ratingFilter > 0) {
      list = list.filter(p => (p.rating || 5) >= this.ratingFilter);
    }

    // 5. In stock filter
    if (this.stockOnly) {
      list = list.filter(p => p.inStock !== false);
    }

    // 5b. 50% or more discount filter
    if (this.discountFilter50) {
      list = list.filter(p => (p.discountPercent || 0) >= 50);
    }

    // 6. Sorting
    if (this.sortOption === 'price-low') {
      list.sort((a, b) => a.priceINR - b.priceINR);
    } else if (this.sortOption === 'price-high') {
      list.sort((a, b) => b.priceINR - a.priceINR);
    } else if (this.sortOption === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (countEl) {
      countEl.textContent = `Showing 1–${list.length} of ${list.length} results`;
    }

    const allTotal = productStore.getProducts().length;
    if (allTotal === 0) {
      stream.innerHTML = `
        <div class="ecom-no-results">
          <div class="no-res-diya">🪔</div>
          <h3>Festive Catalog is Clean & Empty</h3>
          <p>No offerings are currently published in the catalog. You can add your handcrafted offerings via Merchant Admin, connect Supabase / Google Sheets, or load sample festival items for testing.</p>
          <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:16px;">
            <a href="#/admin/products" class="cta-gold-btn" style="text-decoration:none; padding:10px 22px; font-size:13px;"><span>Open Merchant Admin</span></a>
            <button class="cta-gold-btn" id="btn-catalog-load-sample" style="background:rgba(212,175,55,0.15); border:1px solid #D4AF37; color:#FFD700; padding:10px 22px; font-size:13px; cursor:pointer;"><span>Load Sample Offerings</span></button>
          </div>
        </div>
      `;
      const sBtn = stream.querySelector('#btn-catalog-load-sample');
      if (sBtn) {
        sBtn.addEventListener('click', () => {
          productStore.seedSampleFestiveCatalog();
          this.renderCatalogList();
        });
      }
      return;
    }

    if (list.length === 0) {
      stream.innerHTML = `
        <div class="ecom-no-results">
          <div class="no-res-diya">🔍</div>
          <h3>No Offerings Found</h3>
          <p>No products match your selected filters or search terms.</p>
          <button class="ecom-reset-filter-btn" id="btn-reset-filters">Reset All Filters</button>
        </div>
      `;
      const rst = stream.querySelector('#btn-reset-filters');
      if (rst) {
        rst.addEventListener('click', () => {
          this.selectedCategory = 'all';
          this.priceFilter = 'all';
          this.ratingFilter = 0;
          this.discountFilter50 = false;
          this.stockOnly = false;
          this.searchQuery = '';
          this.showListing('all');
        });
      }
      return;
    }

    const categoryTitles = {
      all: 'Grand Festive Bazaar • All Collections',
      diyas: 'Hand-Cast Royal Brass Diyas & Deepams',
      decor: 'Artisanal Urlis, Urli Stands & Home Decor',
      apparel: 'Pure Handloom Silk Kurtas & Festive Attire',
      torans: 'Traditional Brass & Floral Torans',
      lanterns: 'Heritage Brass Jali Hanging Lanterns',
      hampers: 'Auspicious Curated Festive Gift Hampers',
      heirlooms: 'Royal Handcrafted Heirlooms & Artifacts'
    };

    const categoryHeroDescs = {
      all: 'Explore curated royal brassware, handloom festival apparel, and handcrafted auspicious decor for your home and family.',
      diyas: 'Pure solid brass deepams crafted with centuries-old lost-wax casting, spreading radiant festive light across your home.',
      decor: 'Elevate your living sanctuary with hand-hammered brass urlis, auspicious floating flower bowls, and artisanal brass stands handcrafted in Moradabad and Thanjavur.',
      apparel: 'Pure handloom Mulberry silk kurtas, Varanasi brocades, and gossamer Chanderi dupattas woven by generational master weavers.',
      torans: 'Traditional velvet and brass-ghungroo bandhanwars embroidered with Shubh-Labh and Kalash motifs to usher festive elegance into your home.',
      lanterns: 'Heritage Mughal-Moroccan laser-cut brass lanterns casting mesmerizing geometric starburst shadows across balconies and foyers.',
      hampers: 'Auspicious celebratory chests brimming with 24K edible gold sweets, Kashmiri mamra almonds, raw organic honey, and royal brassware.',
      heirlooms: 'Rare master-crafted bronzes, Swamimalai heritage bell deepams, and ceremonial polki treasures passed down across generations.'
    };

    const currentTitle = categoryTitles[this.selectedCategory] || 'Festive Marketplace Offerings';
    const currentHeroDesc = categoryHeroDescs[this.selectedCategory] || 'Explore curated royal brassware, handloom festival apparel, and handcrafted auspicious decor.';

    stream.innerHTML = `
      <!-- Category Hero Top Banner -->
      <div class="ecom-category-hero-banner">
        <div class="hero-banner-content">
          <div class="hero-banner-tag">✦ e-com mart CURATED COLLECTION ✦</div>
          <h2 class="hero-banner-title">${currentTitle}</h2>
          <p class="hero-banner-desc">${currentHeroDesc}</p>
        </div>
        <div class="hero-banner-stats">
          <div class="banner-stat-pill">✨ ${list.length} Offerings Available</div>
          <div class="banner-stat-pill">👑 100% Artisan Certified</div>
          <div class="banner-stat-pill">🚀 Free Express Shipping</div>
        </div>
      </div>

      <!-- Flipkart / Amazon Products Grid (Strictly 2-Column on Mobile - Screenshot 1) -->
      <div class="ecom-grid-container">
        ${list.map(p => this.renderFlipkartCard(p)).join('')}
      </div>
    `;
  }

  renderFlipkartCard(p) {
    const hasDiscount = p.originalPriceINR && p.originalPriceINR > p.priceINR;
    const discountPercent = p.discountPercent || (hasDiscount ? Math.round(((p.originalPriceINR - p.priceINR) / p.originalPriceINR) * 100) : 0);
    const salePriceFormatted = this.formatCurrency(p.priceINR, p.priceUSD);
    const origPriceFormatted = hasDiscount ? this.formatCurrency(p.originalPriceINR, Math.round(p.originalPriceINR * 0.012)) : '';
    const imgUrl = (p.imageUrl && p.imageUrl.trim().length > 5) ? p.imageUrl : '/assets/products/diya_peacock.jpg';

    const pReviews = productStore.getProductReviews(p.id) || [];
    const reviewCount = pReviews.length;
    const avgScore = reviewCount > 0 
      ? (pReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviewCount).toFixed(1)
      : (p.rating ? Number(p.rating).toFixed(1) : '4.2');

    const isFav = this.isWishlisted(p.id);
    const brandName = p.origin ? p.origin.split(',')[0].toUpperCase().slice(0, 16) : 'VERIFIED';

    return `
      <div class="ecom-product-card" data-card-id="${p.id}">
        <!-- Image Container with Wishlist Button (Screenshot 1) -->
        <div class="ecom-card-media" data-click-action="view-detail" data-id="${p.id}">
          <img src="${imgUrl}" alt="${p.name}" class="ecom-card-img" loading="lazy" onerror="this.src='/assets/products/diya_peacock.jpg';" />
          <button class="card-wishlist-btn ${isFav ? 'active' : ''}" data-wishlist-id="${p.id}" aria-label="Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? '#EF4444' : 'none'}" stroke="${isFav ? '#EF4444' : '#64748B'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>

        <!-- Product Content (Screenshot 1) -->
        <div class="ecom-card-details">
          <div class="card-sub-brand-line">
            <span class="card-sponsored-label">Sponsored</span>
            <span class="card-brand-name">${brandName}</span>
          </div>

          <div class="ecom-card-title-row">
            <h3 class="ecom-card-title" data-click-action="view-detail" data-id="${p.id}" title="${p.name}">
              ${p.name}
            </h3>
          </div>

          <!-- Price & Green Discount Line (Flipkart Style: ↓76% ₹2,999 ₹699) -->
          <div class="ecom-price-section">
            ${hasDiscount ? `<span class="ecom-discount-green">↓${discountPercent}%</span>` : ''}
            ${hasDiscount ? `<span class="ecom-mrp-strike">${origPriceFormatted}</span>` : ''}
            <span class="ecom-sale-price">${salePriceFormatted}</span>
          </div>

          <!-- Purple Top Discount Badge (Screenshot 1) -->
          <div class="card-sale-purple-badge">Top Discount of the Sale</div>

          <!-- Rating Row with Assured Badge (Screenshot 1) -->
          <div class="ecom-card-rating">
            <div class="card-rating-stars-group">
              <span class="card-star">★</span>
              <span class="card-star">★</span>
              <span class="card-star">★</span>
              <span class="card-star">★</span>
              <span class="card-star empty">★</span>
              <span class="card-rating-score-num">${avgScore}</span>
            </div>
            <div class="assured-badge-pill">
              <span class="assured-tick">🛡️</span>
              <span class="assured-text">Assured</span>
            </div>
          </div>

          <!-- Quick Add Button -->
          <div class="ecom-card-actions">
            <button class="ecom-add-to-cart-yellow-btn" data-action="quick-add" data-id="${p.id}" ${!p.inStock ? 'disabled' : ''}>
              ${p.inStock ? 'Add to cart' : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showProductDetail(productId, syncHash = true) {
    this.activeProductId = productId;
    const wrapper = this.container.querySelector('#ecom-product-page-wrapper');
    if (wrapper) wrapper.style.display = 'block';

    if (syncHash) {
      const hashStr = `#/product/${productId}`;
      if (window.location.hash !== hashStr) {
        history.pushState(null, '', hashStr);
      }
    }

    this.renderProductDetail(productId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderProductDetail(productId) {
    const product = productStore.getProductById(productId);
    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!product || !mainContent) return;

    const hasDiscount = product.originalPriceINR && product.originalPriceINR > product.priceINR;
    const discountPercent = product.discountPercent || (hasDiscount ? Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100) : 0);
    const salePriceFormatted = this.formatCurrency(product.priceINR, product.priceUSD);
    const origPriceFormatted = hasDiscount ? this.formatCurrency(product.originalPriceINR, Math.round(product.originalPriceINR * 0.012)) : '';
    const imgUrl = (product.imageUrl && product.imageUrl.trim().length > 5) ? product.imageUrl : '/assets/products/diya_peacock.jpg';
    const reviews = productStore.getProductReviews(product.id) || [];
    const totalReviews = reviews.length;
    const avgScore = totalReviews > 0
      ? (reviews.reduce((s, r) => s + (Number(r.rating) || 5), 0) / totalReviews).toFixed(1)
      : null;
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const s = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      starCounts[s] = (starCounts[s] || 0) + 1;
    });
    const pct5 = totalReviews > 0 ? Math.round((starCounts[5] / totalReviews) * 100) : 0;
    const pct4 = totalReviews > 0 ? Math.round((starCounts[4] / totalReviews) * 100) : 0;
    const pct3 = totalReviews > 0 ? Math.round((starCounts[3] / totalReviews) * 100) : 0;
    const pct2 = totalReviews > 0 ? Math.round((starCounts[2] / totalReviews) * 100) : 0;
    const pct1 = totalReviews > 0 ? Math.round((starCounts[1] / totalReviews) * 100) : 0;

    const dynamicDeliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    mainContent.innerHTML = `
      <!-- Mobile Flipkart/Amazon Style Header (Screenshot 2 & 3) -->
      <header class="ecom-mobile-top-header">
        <button class="m-back-btn" id="crumb-back-catalog-mobile" aria-label="Go Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div class="m-search-box">
          <span class="m-search-glass-icon">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </span>
          <input type="text" id="detail-m-search-input" placeholder="Search for products" />
        </div>
        <button class="m-header-cart-icon" id="btn-detail-mobile-cart" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </button>
      </header>

      <!-- Desktop Breadcrumb (Hidden on Mobile) -->
      <div class="ecom-detail-breadcrumb">
        <a href="#" id="crumb-back-catalog">‹ Back to All Products</a>
        <span class="crumb-sep">|</span>
        <span>Festive Home & Living</span>
        <span class="crumb-sep">›</span>
        <span>${product.categoryName || 'Home Decor'}</span>
        <span class="crumb-sep">›</span>
        <span class="crumb-product-title">${product.name}</span>
      </div>

      <!-- Detail Layout: Left Gallery + Middle Specs + Right Buy Box -->
      <div class="ecom-detail-main-layout">
        <!-- 1. Left Column: Multi-Media Gallery with Thumbnails & Zoom (Images, GIFs, Videos) -->
        <div class="ecom-detail-gallery-col">
          <div class="gallery-thumbnails" id="product-gallery-thumbnails">
            ${(() => {
              const mediaList = (Array.isArray(product.media) && product.media.length > 0)
                ? product.media
                : [
                    { type: 'image', url: imgUrl },
                    { type: 'image', url: imgUrl, filter: 'brightness(1.08)' },
                    { type: 'image', url: imgUrl, filter: 'contrast(1.15)' }
                  ];

              return mediaList.map((m, idx) => {
                const isVideo = m.type === 'video' || (m.url && m.url.match(/\.(mp4|webm|mov)(\?.*)?$/i));
                const thumbInner = isVideo
                  ? `<div class="detail-thumb-video-icon">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="#D4AF37"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                       <small>VIDEO</small>
                     </div>`
                  : `<img src="${m.url}" alt="${product.name}" style="${m.filter ? `filter: ${m.filter};` : ''}" onerror="this.src='/assets/products/diya_peacock.jpg';" />`;

                return `
                  <div class="thumb-box ${idx === 0 ? 'active' : ''}" data-media-idx="${idx}" data-media-type="${isVideo ? 'video' : 'image'}" data-media-url="${m.url}">
                    ${thumbInner}
                  </div>
                `;
              }).join('');
            })()}
          </div>

          <div class="gallery-primary-display" id="product-gallery-container">
            <div class="gallery-img-wrapper" id="gallery-zoom-wrapper">
              ${(() => {
                const firstMedia = (Array.isArray(product.media) && product.media.length > 0) ? product.media[0] : null;
                const isVideo = firstMedia && (firstMedia.type === 'video' || firstMedia.url.match(/\.(mp4|webm|mov)(\?.*)?$/i));
                if (isVideo) {
                  return `
                    <video src="${firstMedia.url}" id="main-product-display-video" class="primary-detail-img primary-detail-video" autoplay loop muted playsinline controls></video>
                    <img src="${imgUrl}" alt="${product.name}" id="main-product-display-img" class="primary-detail-img" style="display:none;" onerror="this.src='/assets/products/diya_peacock.jpg';" />
                  `;
                }
                return `
                  <img src="${imgUrl}" alt="${product.name}" id="main-product-display-img" class="primary-detail-img" onerror="this.src='/assets/products/diya_peacock.jpg';" />
                  <video id="main-product-display-video" class="primary-detail-img primary-detail-video" autoplay loop muted playsinline controls style="display:none;"></video>
                `;
              })()}
              <!-- Floating Rating Pill Over Image (Screenshot 2) -->
              <div class="mobile-detail-floating-rating">
                <span>${avgScore || '4.2'}</span> <span class="rating-star-icon">★</span> <span class="rating-sep">|</span> <span>${totalReviews > 0 ? `${totalReviews}+` : '1K+'}</span>
              </div>
              <div class="zoom-lens" id="zoom-lens"></div>
            </div>

            <!-- Mobile Dot Pagination Below Image (Screenshot 2) -->
            <div class="detail-gallery-dots-row" id="detail-gallery-dots">
              ${(() => {
                const count = (Array.isArray(product.media) && product.media.length > 0) ? product.media.length : 3;
                let dots = '';
                for (let i = 0; i < count; i++) {
                  dots += `<span class="detail-gallery-dot ${i === 0 ? 'active' : ''}" data-dot-idx="${i}"></span>`;
                }
                return dots;
              })()}
            </div>

            <!-- Amazon / Flipkart Style Side Zoom Window -->
            <div class="zoom-result-window" id="zoom-result-window">
              <img src="${imgUrl}" id="zoom-result-img" alt="Zoomed view" onerror="this.src='/assets/products/diya_peacock.jpg';" />
            </div>
            <div class="click-to-zoom-hint">🔍 Roll over image to zoom in HD • Multi-angle craftsmanship</div>
          </div>
        </div>

        <!-- 2. Middle Column: Product Title, Ratings, Pricing, Rich Content -->
        <div class="ecom-detail-info-col">
          <h1 class="detail-product-title">${product.name}</h1>
          <div class="detail-artisan-brand">Visit the ${product.origin || 'Moradabad Master Artisan'} Store</div>

          <!-- Rating Row -->
          <div class="detail-rating-row">
            ${totalReviews > 0 ? `
              <span class="detail-stars">${'★'.repeat(Math.min(5, Math.round(avgScore)))}</span>
              <span class="detail-rating-num">${avgScore}</span>
              <a href="#reviews-section" class="detail-review-count">(${totalReviews} verified customer reviews)</a>
            ` : `
              <span class="detail-rating-num" style="color:var(--text-secondary); font-size:13px;">★ 100% Authentic Artisan Craft • <a href="#reviews-section" class="detail-review-count">Be the first to review</a></span>
            `}
          </div>

          <!-- Color / Variant Thumbnails Row (Screenshot 2) -->
          <div class="detail-variant-selector-section">
            <div class="variant-label-title">Selected Variant: <strong>${product.name.slice(0, 32)}</strong></div>
            <div class="variant-thumbnails-rail">
              <div class="variant-thumb-card active">
                <img src="${imgUrl}" alt="${product.name}" />
              </div>
              ${productStore.getProducts().filter(p => p.id !== product.id).slice(0, 4).map(simP => `
                <div class="variant-thumb-card ${!simP.inStock ? 'out-of-stock-card' : ''}" data-click-action="view-detail" data-id="${simP.id}">
                  <img src="${simP.imageUrl || '/assets/products/diya_peacock.jpg'}" alt="${simP.name}" />
                  ${!simP.inStock ? `<span class="variant-oos-badge">Out of stock</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="detail-hr"></div>

          <!-- Limited Time Deal Tag -->
          <div class="detail-deal-badge">Limited time deal</div>

          <!-- Price Row with Discount in Red -->
          <div class="detail-price-box">
            <div class="detail-price-main-line">
              ${hasDiscount ? `<span class="detail-discount-percent-red">-${discountPercent}%</span>` : ''}
              <span class="detail-sale-price">${salePriceFormatted}</span>
            </div>
            ${hasDiscount ? `
              <div class="detail-mrp-subline">
                <span class="mrp-title">M.R.P.:</span>
                <span class="mrp-strike">${origPriceFormatted}</span>
              </div>
            ` : ''}
            <div class="detail-tax-line">Inclusive of all taxes & sacred festive packaging</div>
          </div>

          <!-- Offers Cards Carousel / Bank Offers -->
          <div class="detail-offers-container">
            <div class="offers-header">🏷️ Offers & Auspicious Discounts</div>
            <div class="offers-cards-row">
              <div class="offer-card">
                <strong>Bank Offer</strong>
                <p>Upto 15% discount on HDFC & SBI Credit Cards with code <strong>SAVE15</strong></p>
                <a href="#">1 offer ›</a>
              </div>
              <div class="offer-card">
                <strong>Festive Cashback</strong>
                <p>Flat ₹150 instant cashback with UPI payment on PhonePe or Google Pay.</p>
                <a href="#">1 offer ›</a>
              </div>
              <div class="offer-card">
                <strong>Artisan Guarantee</strong>
                <p>Certified pure virgin brass and handloom silk with quality authenticity certificate.</p>
                <a href="#">Learn more ›</a>
              </div>
            </div>
          </div>

          <div class="detail-hr"></div>

          <!-- Hero Small Description -->
          <div class="detail-hero-small-desc">
            <div class="small-desc-badge">HIGHLIGHTS</div>
            <p class="hero-tagline-text">${product.tagline || 'Handcrafted masterpiece created for Indian festive celebrations.'}</p>
          </div>

          <!-- Rich Formatted Content & Specs -->
          <div class="detail-rich-content">
            <h3 class="specs-title">About this item</h3>
            <div class="rich-body-text">
              ${product.description || 'Crafted with devotion by generational master artisans.'}
            </div>

            <ul class="detail-bullet-points">
              ${(product.features || [
                "Solid Virgin Brass with protective antique gold lacquer",
                "Handcrafted by generational artisans with authentic heirloom engraving",
                "Includes premium festive gift box packaging",
                "100% login-free instant checkout with official order invoice"
              ]).map(f => `<li><span>•</span> <div>${f}</div></li>`).join('')}
            </ul>

            ${product.material ? `
              <div class="detail-attribute-table">
                <div class="attr-row"><strong>Material:</strong> <span>${product.material}</span></div>
                <div class="attr-row"><strong>Origin:</strong> <span>${product.origin || 'India'}</span></div>
                <div class="attr-row"><strong>Category:</strong> <span>${product.categoryName || product.category}</span></div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 3. Right Column: Buy Box (Flipkart / Amazon style with big buy button) -->
        <div class="ecom-detail-buybox-col">
          <div class="buybox-card">
            <div class="buybox-price">${salePriceFormatted}</div>
            <div class="buybox-delivery-info">
              <div>FREE delivery by <strong>${dynamicDeliveryDate}</strong>. <a href="#">Details</a></div>
              <div class="fastest-delivery">Express dispatch within <strong>24-48 hours</strong>.</div>
            </div>

            <div class="buybox-stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}">
              ${product.inStock ? 'In stock' : 'Currently Unavailable'}
            </div>

            <div class="buybox-qty-row">
              <label for="buybox-qty-select">Quantity:</label>
              <select id="buybox-qty-select" class="buybox-select">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>

            <!-- Big Action Buttons -->
            <div class="buybox-buttons-stack">
              <button class="buybox-add-to-cart-btn" id="btn-buybox-add" ${!product.inStock ? 'disabled' : ''}>
                <span>Add to Cart</span>
              </button>
              
              <button class="buybox-buy-now-orange-btn" id="btn-buybox-buy-now" ${!product.inStock ? 'disabled' : ''}>
                <span>⚡ Buy Now</span>
              </button>
            </div>

            <div class="buybox-seller-meta">
              <div class="meta-row"><span>Ships from:</span> <strong>e-com mart Express</strong></div>
              <div class="meta-row"><span>Sold by:</span> <strong>${product.origin ? product.origin.split(',')[0] + ' Artisans' : 'Royal Heritage Craft'}</strong></div>
              <div class="meta-row"><span>Payment:</span> <strong>Secure transaction</strong></div>
            </div>

            <div class="buybox-trust-icons">
              <div class="trust-icon-item">
                <span>🛡️</span>
                <small>Authentic Artisan</small>
              </div>
              <div class="trust-icon-item">
                <span>🚚</span>
                <small>Free Delivery</small>
              </div>
              <div class="trust-icon-item">
                <span>🪔</span>
                <small>Blessed Packaging</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Reviews & Blessings Section -->
      <div class="ecom-detail-reviews-wrapper" id="reviews-section">
        <div class="reviews-section-header">
          <h2 class="reviews-section-title">Customer Reviews & Blessings (${reviews.length})</h2>
          <button class="write-review-trigger-btn" id="btn-toggle-review-form">
            <span>✍️ Write a Customer Review</span>
          </button>
        </div>

        <div class="reviews-container-grid">
          <!-- Left: Rating Summary & Review Prompt -->
          <div class="reviews-summary-card">
            <div class="overall-rating-number">${product.rating || 5.0}</div>
            <div class="overall-stars">${'★'.repeat(Math.round(product.rating || 5))}${'☆'.repeat(5 - Math.round(product.rating || 5))}</div>
            <div class="overall-subtext">${product.reviewsCount || reviews.length || 1} verified customer ratings</div>
            <div class="rating-bar-row">
              <span>5 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: ${pct5}%;"></div></div>
              <span>${pct5}%</span>
            </div>
            <div class="rating-bar-row">
              <span>4 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: ${pct4}%;"></div></div>
              <span>${pct4}%</span>
            </div>
            <div class="rating-bar-row">
              <span>3 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: ${pct3}%;"></div></div>
              <span>${pct3}%</span>
            </div>
            <div class="rating-bar-row">
              <span>2 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: ${pct2}%;"></div></div>
              <span>${pct2}%</span>
            </div>
            <div class="rating-bar-row">
              <span>1 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: ${pct1}%;"></div></div>
              <span>${pct1}%</span>
            </div>

            <div class="review-this-box">
              <h4>Review this product</h4>
              <p>Share your festive thoughts and photos with other customers</p>
              <button class="ecom-outline-btn" id="btn-open-review-form">Write a product review</button>
            </div>
          </div>

          <!-- Right Column: Add Review Form + Existing Reviews Feed -->
          <div class="reviews-feed-col">
            <!-- Review Submission Form (Supports Raw Image Upload & Stars) -->
            <div class="add-review-card-panel" id="add-review-card-panel">
              <h3 class="panel-form-title">✨ Bless This Offering with a Review</h3>
              
              <div class="form-row-2">
                <div class="form-group">
                  <label for="rev-input-name">Your Full Name *</label>
                  <input type="text" id="rev-input-name" class="festive-input" placeholder="e.g. Meera Singhania" required />
                </div>
                <div class="form-group">
                  <label for="rev-input-city">Your City / Location</label>
                  <input type="text" id="rev-input-city" class="festive-input" placeholder="e.g. Jaipur, Rajasthan" />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label for="rev-input-title">Review Headline / Summary</label>
                  <input type="text" id="rev-input-title" class="festive-input" placeholder="e.g. Absolutely stunning Moradabad brass finish!" />
                </div>
                <div class="form-group">
                  <label for="rev-input-rating">Overall Rating *</label>
                  <div class="interactive-star-picker" id="rev-star-picker" data-rating="5">
                    <span class="star-btn active" data-val="1">★</span>
                    <span class="star-btn active" data-val="2">★</span>
                    <span class="star-btn active" data-val="3">★</span>
                    <span class="star-btn active" data-val="4">★</span>
                    <span class="star-btn active" data-val="5">★</span>
                    <strong class="star-rating-label" id="star-rating-label">5.0 - Auspicious (Excellent)</strong>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label for="rev-input-comment">Your Review / Festive Experience *</label>
                <textarea id="rev-input-comment" class="festive-textarea" rows="3" placeholder="How was the craftsmanship, packaging, and sacred feel of this offering?" required></textarea>
              </div>

              <!-- Raw Image & Avatar Upload Group -->
              <div class="form-group review-upload-group">
                <label>Add Photos (Customer Unboxing Photo & Optional Profile Avatar)</label>
                <div class="storefront-review-upload-cols" style="display:flex; gap:14px; flex-wrap:wrap;">
                  <!-- Unboxing Photo -->
                  <div style="flex:1; min-width:200px;">
                    <div class="review-upload-dropzone" id="review-upload-dropzone">
                      <input type="file" id="review-image-input" accept="image/*" class="file-hidden-input" />
                      <div class="dropzone-content">
                        <span class="upload-cam-icon">📷</span>
                        <span class="upload-prompt-text"><strong>Upload unboxing photo</strong></span>
                        <small>PNG, JPG, WebP photos</small>
                      </div>
                    </div>
                    <div class="review-image-preview-bar" id="review-image-preview-bar" style="display: none;">
                      <img id="review-preview-img" src="" alt="Customer uploaded preview" />
                      <div class="preview-info">
                        <span id="preview-filename">photo.jpg</span>
                        <button type="button" class="btn-remove-preview" id="btn-remove-preview">✕ Remove</button>
                      </div>
                    </div>
                  </div>

                  <!-- Optional Avatar Upload -->
                  <div style="width:160px;">
                    <div class="review-upload-dropzone" id="review-avatar-dropzone" style="padding:14px;">
                      <input type="file" id="review-avatar-file-input" accept="image/*" class="file-hidden-input" />
                      <div class="dropzone-content">
                        <span class="upload-cam-icon" style="font-size:22px;">👤</span>
                        <span class="upload-prompt-text" style="font-size:11px;"><strong>Profile Avatar</strong></span>
                        <small>Optional</small>
                      </div>
                    </div>
                    <div class="review-image-preview-bar" id="review-avatar-preview-bar" style="display: none; padding:6px 10px;">
                      <img id="review-avatar-preview-img" src="" alt="Avatar preview" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />
                      <button type="button" class="btn-remove-preview" id="btn-remove-avatar-preview" style="font-size:10px;">✕ Remove</button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-action-row">
                <button type="button" class="btn-submit-customer-review" id="btn-submit-review">
                  <span>Submit Verified Review</span>
                </button>
                <button type="button" class="btn-cancel-review" id="btn-cancel-review">Cancel</button>
              </div>
            </div>

            <!-- Customer Reviews Carousel Slider -->
            <div class="reviews-carousel-wrapper">
              <div class="reviews-carousel-controls">
                <span class="carousel-counter-tag">Swipe or click arrows to explore customer unboxings & blessings</span>
                <div class="carousel-arrow-btns">
                  <button type="button" class="carousel-nav-btn prev" id="rev-carousel-prev" aria-label="Previous Review">‹</button>
                  <button type="button" class="carousel-nav-btn next" id="rev-carousel-next" aria-label="Next Review">›</button>
                </div>
              </div>

              <div class="reviews-carousel-track" id="reviews-carousel-track">
                ${reviews.length > 0 ? reviews.map(r => {
                  const hasAvatar = !!(r.avatarUrl && r.avatarUrl.trim().length > 5);
                  const initial = (r.name || 'P').trim().charAt(0).toUpperCase();
                  const photoSrc = r.photoUrl || r.imageUrl || '';
                  return `
                  <div class="review-item-card carousel-slide-card">
                    <div class="r-author-row">
                      ${hasAvatar ? `
                        <img src="${r.avatarUrl}" class="r-avatar-img" alt="${r.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <div class="r-avatar-fallback" style="display:none;">${initial}</div>
                      ` : `
                        <div class="r-avatar-fallback">${initial}</div>
                      `}
                      <div class="r-author-meta">
                        <div class="r-author-name-line">
                          <strong>${r.name}</strong>
                          ${r.verified !== false ? `<span class="r-verified-pill">✓ Verified</span>` : ''}
                        </div>
                        ${r.city ? `<div class="r-city-pill">📍 ${r.city}</div>` : ''}
                      </div>
                    </div>
                    <div class="r-rating-line">
                      <span class="r-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
                      <span class="r-rating-val">${r.rating || 5}.0</span>
                      <span class="r-date">${r.date || 'Recent'}</span>
                    </div>
                    ${r.title ? `<strong class="r-headline-text">${r.title}</strong>` : ''}
                    <p class="r-text">"${r.comment}"</p>
                    ${photoSrc ? `
                      <div class="review-attached-photo">
                        <img src="${photoSrc}" alt="Customer unboxing photo" class="r-customer-uploaded-img" onclick="window.open(this.src, '_blank')" title="Click to view full photo" />
                        <span class="r-photo-ugc-badge">📸 Real Unboxing Photo</span>
                      </div>
                    ` : ''}
                  </div>
                  `;
                }).join('') : `
                  <div class="no-reviews-note" style="min-width: 100%;">
                    <div class="note-diya">🪔</div>
                    <h4>No Customer Reviews Yet</h4>
                    <p>Be the first customer to share your blessing and unboxing photos for this handcrafted item!</p>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        <!-- Discounts on Similar Products Carousel (Screenshot 3) -->
        ${(() => {
          const similarProducts = productStore.getProducts().filter(p => p.id !== product.id);
          if (!similarProducts.length) return '';
          return `
            <div class="detail-similar-carousel-section">
              <h3 class="similar-section-title">Discounts on Similar Products</h3>
              <div class="similar-cards-rail">
                ${similarProducts.slice(0, 6).map(sp => {
                  const spHasDisc = sp.originalPriceINR && sp.originalPriceINR > sp.priceINR;
                  const spDiscPct = sp.discountPercent || (spHasDisc ? Math.round(((sp.originalPriceINR - sp.priceINR) / sp.originalPriceINR) * 100) : 74);
                  const spPrice = this.formatCurrency(sp.priceINR, sp.priceUSD);
                  const spOrig = spHasDisc ? this.formatCurrency(sp.originalPriceINR, Math.round(sp.originalPriceINR * 0.012)) : '';
                  return `
                    <div class="similar-item-card" data-click-action="view-detail" data-id="${sp.id}">
                      <div class="similar-card-media">
                        <img src="${sp.imageUrl || '/assets/products/diya_peacock.jpg'}" alt="${sp.name}" loading="lazy" />
                        <span class="similar-ad-pill">AD</span>
                        <div class="similar-rating-pill">${(sp.rating || 4.2).toFixed(1)} ★</div>
                      </div>
                      <div class="similar-card-name" title="${sp.name}">${sp.name}</div>
                      <div class="similar-card-discount">${spDiscPct}% OFF</div>
                      <div class="similar-card-price-row">
                        ${spOrig ? `<span class="similar-orig-strike">${spOrig}</span>` : ''}
                        <span class="similar-sale-price">${spPrice}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- You may also like (Screenshot 3) -->
            <div class="detail-similar-carousel-section" style="margin-top: 18px;">
              <div class="similar-section-header-row">
                <h3 class="similar-section-title">You may also like</h3>
                <span class="similar-ad-pill-sub">AD</span>
              </div>
              <div class="similar-cards-rail">
                ${similarProducts.slice(1, 7).map(sp => {
                  const spHasDisc = sp.originalPriceINR && sp.originalPriceINR > sp.priceINR;
                  const spDiscPct = sp.discountPercent || (spHasDisc ? Math.round(((sp.originalPriceINR - sp.priceINR) / sp.originalPriceINR) * 100) : 70);
                  const spPrice = this.formatCurrency(sp.priceINR, sp.priceUSD);
                  const spOrig = spHasDisc ? this.formatCurrency(sp.originalPriceINR, Math.round(sp.originalPriceINR * 0.012)) : '';
                  return `
                    <div class="similar-item-card" data-click-action="view-detail" data-id="${sp.id}">
                      <div class="similar-card-media">
                        <img src="${sp.imageUrl || '/assets/products/diya_peacock.jpg'}" alt="${sp.name}" loading="lazy" />
                        <div class="similar-rating-pill">${(sp.rating || 4.1).toFixed(1)} ★</div>
                      </div>
                      <div class="similar-card-name" title="${sp.name}">${sp.name}</div>
                      <div class="similar-card-discount">${spDiscPct}% OFF</div>
                      <div class="similar-card-price-row">
                        ${spOrig ? `<span class="similar-orig-strike">${spOrig}</span>` : ''}
                        <span class="similar-sale-price">${spPrice}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        })()}

        <!-- Sticky Buy Now Action Fixture on Mobile (Screenshots 2 & 3) -->
        <div class="product-page-mobile-sticky-bar">
          <button class="mobile-sticky-add-btn" id="btn-mobile-sticky-add" ${!product.inStock ? 'disabled' : ''}>
            <span>Add to cart</span>
          </button>
          <button class="mobile-sticky-buy-btn" id="btn-mobile-sticky-buy" ${!product.inStock ? 'disabled' : ''}>
            <span>Buy now at ${salePriceFormatted}</span>
          </button>
        </div>
      </div>
    `;

    this.bindDetailEvents(product);
  }

  bindListingEvents() {
    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!mainContent) return;

    // Mobile Header Back button & brand icon
    const mBackBtn = mainContent.querySelector('#btn-mobile-header-back');
    if (mBackBtn) {
      mBackBtn.addEventListener('click', () => {
        this.hide();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const mBrandTrigger = mainContent.querySelector('#mobile-brand-home-trigger');
    if (mBrandTrigger) {
      mBrandTrigger.addEventListener('click', () => {
        this.hide();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Mobile Header Cart button
    const mCartBtn = mainContent.querySelector('#btn-mobile-header-cart');
    if (mCartBtn) {
      mCartBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-cart-drawer'));
      });
    }

    // Mobile Search Input & Clear
    const mSearchInput = mainContent.querySelector('#mobile-ecom-search-input');
    const mClearBtn = mainContent.querySelector('#btn-m-search-clear');
    if (mSearchInput) {
      mSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (mClearBtn) mClearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.renderCatalogList();
      });
    }
    if (mClearBtn) {
      mClearBtn.addEventListener('click', () => {
        this.searchQuery = '';
        if (mSearchInput) mSearchInput.value = '';
        mClearBtn.style.display = 'none';
        this.renderCatalogList();
      });
    }

    // Mobile Sort Bottom Sheet
    const openSortBtn = mainContent.querySelector('#btn-open-m-sort');
    const sortSheet = mainContent.querySelector('#m-sort-sheet');
    const sortBackdrop = mainContent.querySelector('#m-sort-backdrop');
    const closeSortBtn = mainContent.querySelector('#btn-close-sort-sheet');

    const toggleSortSheet = (open) => {
      if (sortSheet) sortSheet.classList.toggle('open', open);
      if (sortBackdrop) sortBackdrop.classList.toggle('visible', open);
    };

    if (openSortBtn) openSortBtn.addEventListener('click', () => toggleSortSheet(true));
    if (closeSortBtn) closeSortBtn.addEventListener('click', () => toggleSortSheet(false));
    if (sortBackdrop) sortBackdrop.addEventListener('click', () => toggleSortSheet(false));

    mainContent.querySelectorAll('input[name="m-sort-radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        const deskSort = mainContent.querySelector('#ecom-sort-select');
        if (deskSort) deskSort.value = this.sortOption;
        toggleSortSheet(false);
        this.renderCatalogList();
      });
    });

    // Mobile Filter Bottom Sheet
    const openFilterBtn = mainContent.querySelector('#btn-open-m-filter');
    const filterSheet = mainContent.querySelector('#m-filter-sheet');
    const filterBackdrop = mainContent.querySelector('#m-filter-backdrop');
    const closeFilterBtn = mainContent.querySelector('#btn-close-filter-sheet');
    const clearFiltersBtn = mainContent.querySelector('#btn-sheet-clear-filters');
    const applyFiltersBtn = mainContent.querySelector('#btn-sheet-apply-filters');

    const toggleFilterSheet = (open) => {
      if (filterSheet) filterSheet.classList.toggle('open', open);
      if (filterBackdrop) filterBackdrop.classList.toggle('visible', open);
    };

    if (openFilterBtn) openFilterBtn.addEventListener('click', () => toggleFilterSheet(true));
    if (closeFilterBtn) closeFilterBtn.addEventListener('click', () => toggleFilterSheet(false));
    if (filterBackdrop) filterBackdrop.addEventListener('click', () => toggleFilterSheet(false));

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.selectedCategory = 'all';
        this.priceFilter = 'all';
        this.ratingFilter = 0;
        this.discountFilter50 = false;
        this.stockOnly = false;
        toggleFilterSheet(false);
        this.showListing('all');
      });
    }

    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        const catRadio = mainContent.querySelector('input[name="m-sheet-cat"]:checked');
        const priceRadio = mainContent.querySelector('input[name="m-sheet-price"]:checked');
        const disc50Check = mainContent.querySelector('#m-sheet-disc50');
        const stockCheck = mainContent.querySelector('#m-sheet-stock');

        if (catRadio) this.selectedCategory = catRadio.value;
        if (priceRadio) this.priceFilter = priceRadio.value;
        if (disc50Check) this.discountFilter50 = disc50Check.checked;
        if (stockCheck) this.stockOnly = stockCheck.checked;

        toggleFilterSheet(false);
        this.renderCatalogList();
      });
    }

    // Mobile Filter Chips Delegation
    const chipsTrack = mainContent.querySelector('#mobile-chips-track');
    if (chipsTrack) {
      chipsTrack.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-chip]');
        if (!chip) return;
        const type = chip.getAttribute('data-chip');

        chipsTrack.querySelectorAll('.m-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        switch (type) {
          case 'all':
            this.selectedCategory = 'all';
            this.priceFilter = 'all';
            this.ratingFilter = 0;
            this.discountFilter50 = false;
            this.stockOnly = false;
            break;
          case 'discount50':
            this.discountFilter50 = !this.discountFilter50;
            break;
          case 'under2000':
            this.priceFilter = this.priceFilter === 'under2000' ? 'all' : 'under2000';
            break;
          case 'rating45':
            this.ratingFilter = this.ratingFilter === 4.5 ? 0 : 4.5;
            break;
          case 'stock':
            this.stockOnly = !this.stockOnly;
            break;
          default:
            if (productStore.getActiveCategories().some(c => c.key === type)) {
              this.selectedCategory = (this.selectedCategory === type) ? 'all' : type;
            }
            break;
        }

        this.renderCatalogList();
      });
    }

    // Category radios (Desktop Sidebar)
    mainContent.querySelectorAll('input[name="ecom-cat"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.renderCatalogList();
      });
    });

    // Price radios (Desktop Sidebar)
    mainContent.querySelectorAll('input[name="ecom-price"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.priceFilter = e.target.value;
        this.renderCatalogList();
      });
    });

    // Rating radios (Desktop Sidebar)
    mainContent.querySelectorAll('input[name="ecom-rating"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.ratingFilter = parseFloat(e.target.value);
        this.renderCatalogList();
      });
    });

    // Stock checkbox (Desktop Sidebar)
    const deskStockCheck = mainContent.querySelector('#ecom-stock-check');
    if (deskStockCheck) {
      deskStockCheck.addEventListener('change', (e) => {
        this.stockOnly = e.target.checked;
        this.renderCatalogList();
      });
    }

    // Sort select (Desktop)
    const sortSelect = mainContent.querySelector('#ecom-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        this.renderCatalogList();
      });
    }

    // Card click delegation (view detail, quick add, or wishlist heart toggle)
    const stream = mainContent.querySelector('#ecom-cards-stream');
    if (stream) {
      stream.addEventListener('click', (e) => {
        const wishlistBtn = e.target.closest('[data-wishlist-id]');
        const detailTrigger = e.target.closest('[data-click-action="view-detail"]');
        const addBtn = e.target.closest('[data-action="quick-add"]');

        if (wishlistBtn) {
          e.stopPropagation();
          const pid = wishlistBtn.getAttribute('data-wishlist-id');
          this.toggleWishlist(pid);
          const active = this.isWishlisted(pid);
          wishlistBtn.classList.toggle('active', active);
          const svg = wishlistBtn.querySelector('svg');
          if (svg) {
            svg.setAttribute('fill', active ? '#EF4444' : 'none');
            svg.setAttribute('stroke', active ? '#EF4444' : '#64748B');
          }
          return;
        }

        if (addBtn) {
          e.stopPropagation();
          const pid = addBtn.getAttribute('data-id');
          const p = productStore.getProductById(pid);
          if (p && this.onAddToCart) {
            this.onAddToCart(p);
            const origText = addBtn.textContent;
            addBtn.textContent = '✓ Added!';
            addBtn.style.backgroundColor = '#10B981';
            addBtn.style.color = '#FFF';
            setTimeout(() => {
              addBtn.textContent = origText;
              addBtn.style.backgroundColor = '';
              addBtn.style.color = '';
            }, 1200);
          }
          return;
        }

        if (detailTrigger) {
          const pid = detailTrigger.getAttribute('data-id');
          this.showProductDetail(pid);
        }
      });
    }

    // Crumb home link
    const crumbHome = mainContent.querySelector('#ecom-crumb-home');
    if (crumbHome) {
      crumbHome.addEventListener('click', (e) => {
        e.preventDefault();
        this.hide();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  bindDetailEvents(product) {
    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!mainContent) return;

    // Back to catalog crumb (Desktop & Mobile)
    const backBtn = mainContent.querySelector('#crumb-back-catalog');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showListing(this.selectedCategory);
      });
    }

    const mBackBtn = mainContent.querySelector('#crumb-back-catalog-mobile');
    if (mBackBtn) {
      mBackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showListing(this.selectedCategory);
      });
    }

    // Mobile Header Cart button in detail view
    const mCartBtn = mainContent.querySelector('#btn-detail-mobile-cart');
    if (mCartBtn) {
      mCartBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('open-cart-drawer'));
      });
    }

    // Mobile Header Search input in detail view
    const mDetailSearch = mainContent.querySelector('#detail-m-search-input');
    if (mDetailSearch) {
      mDetailSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = e.target.value.trim();
          this.showListing('all', q);
        }
      });
    }

    // Detail view click delegation for variant thumbnails and similar product cards
    mainContent.querySelectorAll('[data-click-action="view-detail"]').forEach(card => {
      card.addEventListener('click', (e) => {
        const pid = card.getAttribute('data-id');
        if (pid && pid !== product.id) {
          this.showProductDetail(pid);
        }
      });
    });

    // Gallery Dots click indicators
    const galleryDots = mainContent.querySelectorAll('.detail-gallery-dot');
    galleryDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-dot-idx'), 10);
        const thumbs = mainContent.querySelectorAll('.thumb-box');
        if (thumbs[idx]) thumbs[idx].click();
      });
    });

    // Add to cart from buybox
    const addBtn = mainContent.querySelector('#btn-buybox-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const qtySelect = mainContent.querySelector('#buybox-qty-select');
        const qty = qtySelect ? parseInt(qtySelect.value, 10) : 1;
        if (this.onAddToCart) {
          for (let i = 0; i < qty; i++) {
            this.onAddToCart(product);
          }
          addBtn.innerHTML = '<span>✓ Added to Thali!</span>';
          setTimeout(() => {
            addBtn.innerHTML = '<span>Add to Cart</span>';
          }, 1500);
        }
      });
    }

    // Buy Now from buybox (adds and triggers direct checkout)
    const buyNowBtn = mainContent.querySelector('#btn-buybox-buy-now');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        const qtySelect = mainContent.querySelector('#buybox-qty-select');
        const qty = qtySelect ? parseInt(qtySelect.value, 10) : 1;
        if (this.onBuyNow) {
          this.onBuyNow(product, qty);
        }
      });
    }

    // Mobile sticky bar action listeners
    const mobileAddBtn = mainContent.querySelector('#btn-mobile-sticky-add');
    if (mobileAddBtn) {
      mobileAddBtn.addEventListener('click', () => {
        if (this.onAddToCart) {
          this.onAddToCart(product);
          mobileAddBtn.innerHTML = '<span>✓ Added!</span>';
          setTimeout(() => { mobileAddBtn.innerHTML = '<span>Add to Cart</span>'; }, 1500);
        }
      });
    }

    const mobileBuyBtn = mainContent.querySelector('#btn-mobile-sticky-buy');
    if (mobileBuyBtn) {
      mobileBuyBtn.addEventListener('click', () => {
        if (this.onBuyNow) {
          this.onBuyNow(product, 1);
        }
      });
    }

    // Thumbnail switching & sync zoom images / video display
    mainContent.querySelectorAll('.thumb-box').forEach(thumb => {
      const switchMedia = () => {
        mainContent.querySelectorAll('.thumb-box').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const mediaIdx = thumb.getAttribute('data-media-idx');
        if (mediaIdx !== null) {
          mainContent.querySelectorAll('.detail-gallery-dot').forEach((d, i) => {
            d.classList.toggle('active', i === parseInt(mediaIdx, 10));
          });
        }
        const mediaType = thumb.getAttribute('data-media-type');
        const mediaUrl = thumb.getAttribute('data-media-url');
        const mainImg = mainContent.querySelector('#main-product-display-img');
        const mainVideo = mainContent.querySelector('#main-product-display-video');
        const zoomImg = mainContent.querySelector('#zoom-result-img');
        const zoomLens = mainContent.querySelector('#zoom-lens');
        const zoomWindow = mainContent.querySelector('#zoom-result-window');

        if (mediaType === 'video' && mainVideo) {
          if (mainImg) mainImg.style.display = 'none';
          mainVideo.style.display = 'block';
          mainVideo.src = mediaUrl;
          mainVideo.play().catch(() => {});
          if (zoomLens) zoomLens.style.display = 'none';
          if (zoomWindow) zoomWindow.style.display = 'none';
        } else if (mainImg) {
          if (mainVideo) {
            mainVideo.pause();
            mainVideo.style.display = 'none';
          }
          mainImg.style.display = 'block';
          const img = thumb.querySelector('img');
          const src = img ? img.src : mediaUrl;
          mainImg.src = src;
          mainImg.style.filter = img ? (img.style.filter || '') : '';
          if (zoomImg) {
            zoomImg.src = src;
            zoomImg.style.filter = img ? (img.style.filter || '') : '';
          }
        }
      };

      thumb.addEventListener('mouseenter', switchMedia);
      thumb.addEventListener('click', switchMedia);
    });

    // Amazon / Flipkart Interactive Hover Zoom Lens Logic
    const zoomWrapper = mainContent.querySelector('#gallery-zoom-wrapper');
    const zoomLens = mainContent.querySelector('#zoom-lens');
    const zoomWindow = mainContent.querySelector('#zoom-result-window');
    const zoomResultImg = mainContent.querySelector('#zoom-result-img');
    const mainImg = mainContent.querySelector('#main-product-display-img');

    if (zoomWrapper && zoomLens && zoomWindow && zoomResultImg && mainImg) {
      const zoomFactor = 2.5;

      const handleMove = (e) => {
        const rect = zoomWrapper.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // Lens half dimensions
        const lw = zoomLens.offsetWidth / 2;
        const lh = zoomLens.offsetHeight / 2;

        // Clamp lens to wrapper bounds
        let lensX = Math.max(0, Math.min(rect.width - zoomLens.offsetWidth, x - lw));
        let lensY = Math.max(0, Math.min(rect.height - zoomLens.offsetHeight, y - lh));

        zoomLens.style.left = `${lensX}px`;
        zoomLens.style.top = `${lensY}px`;

        // Scale result image inside zoom window
        const scaleX = (zoomWindow.offsetWidth / zoomLens.offsetWidth);
        const scaleY = (zoomWindow.offsetHeight / zoomLens.offsetHeight);

        zoomResultImg.style.width = `${rect.width * scaleX}px`;
        zoomResultImg.style.height = `${rect.height * scaleY}px`;
        zoomResultImg.style.left = `-${lensX * scaleX}px`;
        zoomResultImg.style.top = `-${lensY * scaleY}px`;
      };

      zoomWrapper.addEventListener('mouseenter', (e) => {
        zoomLens.style.display = 'block';
        zoomWindow.style.display = 'block';
        zoomResultImg.src = mainImg.src;
        zoomResultImg.style.filter = mainImg.style.filter || '';
        handleMove(e);
      });

      zoomWrapper.addEventListener('mousemove', handleMove);

      zoomWrapper.addEventListener('mouseleave', () => {
        zoomLens.style.display = 'none';
        zoomWindow.style.display = 'none';
      });

      // Full screen modal view on click
      zoomWrapper.addEventListener('click', () => {
        window.open(mainImg.src, '_blank');
      });
    }

    // Toggle Review Form Panel
    const toggleRevBtn = mainContent.querySelector('#btn-toggle-review-form');
    const openRevBtn = mainContent.querySelector('#btn-open-review-form');
    const revFormPanel = mainContent.querySelector('#add-review-card-panel');
    const cancelRevBtn = mainContent.querySelector('#btn-cancel-review');

    const showReviewForm = () => {
      if (revFormPanel) {
        revFormPanel.classList.add('visible');
        revFormPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    if (toggleRevBtn) toggleRevBtn.addEventListener('click', showReviewForm);
    if (openRevBtn) openRevBtn.addEventListener('click', showReviewForm);
    if (cancelRevBtn) {
      cancelRevBtn.addEventListener('click', () => {
        if (revFormPanel) revFormPanel.classList.remove('visible');
      });
    }

    // Interactive Star Rating Picker
    const starPicker = mainContent.querySelector('#rev-star-picker');
    const starLabel = mainContent.querySelector('#star-rating-label');
    const starLabels = {
      1: "1.0 - Needs Improvement",
      2: "2.0 - Fair Offering",
      3: "3.0 - Good Handcraft",
      4: "4.0 - Very Good & Auspicious",
      5: "5.0 - Auspicious (Excellent)"
    };

    if (starPicker) {
      const starBtns = starPicker.querySelectorAll('.star-btn');
      starBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const val = parseInt(btn.getAttribute('data-val'), 10);
          starPicker.setAttribute('data-rating', val);
          starBtns.forEach(b => {
            const bVal = parseInt(b.getAttribute('data-val'), 10);
            if (bVal <= val) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
          if (starLabel) starLabel.textContent = starLabels[val] || `${val}.0`;
        });
      });
    }

    // Raw Image Upload Handling (File input, Drag & Drop, FileReader data URL)
    let uploadedImageBase64 = null;
    const fileInput = mainContent.querySelector('#review-image-input');
    const dropzone = mainContent.querySelector('#review-upload-dropzone');
    const previewBar = mainContent.querySelector('#review-image-preview-bar');
    const previewImg = mainContent.querySelector('#review-preview-img');
    const previewFilename = mainContent.querySelector('#preview-filename');
    const removePreviewBtn = mainContent.querySelector('#btn-remove-preview');

    const processFile = (file) => {
      if (!file || !file.type.startsWith('image/')) {
        alert("Please select a valid image file (PNG, JPG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImageBase64 = e.target.result;
        if (previewImg) previewImg.src = uploadedImageBase64;
        if (previewFilename) previewFilename.textContent = file.name;
        if (previewBar) previewBar.style.display = 'flex';
        if (dropzone) dropzone.style.display = 'none';
      };
      reader.readAsDataURL(file);
    };

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          processFile(e.target.files[0]);
        }
      });
    }

    if (removePreviewBtn) {
      removePreviewBtn.addEventListener('click', () => {
        uploadedImageBase64 = null;
        if (fileInput) fileInput.value = '';
        if (previewBar) previewBar.style.display = 'none';
        if (dropzone) dropzone.style.display = 'flex';
      });
    }

    // Optional Avatar Upload Handling
    let uploadedAvatarBase64 = null;
    const avatarInput = mainContent.querySelector('#review-avatar-file-input');
    const avatarDropzone = mainContent.querySelector('#review-avatar-dropzone');
    const avatarPreviewBar = mainContent.querySelector('#review-avatar-preview-bar');
    const avatarPreviewImg = mainContent.querySelector('#review-avatar-preview-img');
    const removeAvatarBtn = mainContent.querySelector('#btn-remove-avatar-preview');

    if (avatarDropzone && avatarInput) {
      avatarDropzone.addEventListener('click', () => avatarInput.click());

      avatarInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
          }
          const reader = new FileReader();
          reader.onload = (re) => {
            uploadedAvatarBase64 = re.target.result;
            if (avatarPreviewImg) avatarPreviewImg.src = uploadedAvatarBase64;
            if (avatarPreviewBar) avatarPreviewBar.style.display = 'flex';
            if (avatarDropzone) avatarDropzone.style.display = 'none';
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (removeAvatarBtn) {
      removeAvatarBtn.addEventListener('click', () => {
        uploadedAvatarBase64 = null;
        if (avatarInput) avatarInput.value = '';
        if (avatarPreviewBar) avatarPreviewBar.style.display = 'none';
        if (avatarDropzone) avatarDropzone.style.display = 'flex';
      });
    }

    // Submit Review Handler
    const submitRevBtn = mainContent.querySelector('#btn-submit-review');
    if (submitRevBtn) {
      submitRevBtn.addEventListener('click', () => {
        const nameInput = mainContent.querySelector('#rev-input-name');
        const cityInput = mainContent.querySelector('#rev-input-city');
        const titleInput = mainContent.querySelector('#rev-input-title');
        const commentInput = mainContent.querySelector('#rev-input-comment');

        const name = nameInput ? nameInput.value.trim() : '';
        const city = cityInput ? cityInput.value.trim() : '';
        const title = titleInput ? titleInput.value.trim() : '';
        const comment = commentInput ? commentInput.value.trim() : '';
        const rating = starPicker ? parseInt(starPicker.getAttribute('data-rating'), 10) : 5;

        if (!name) {
          alert("Please enter your name.");
          nameInput.focus();
          return;
        }

        if (!comment) {
          alert("Please enter your review comments.");
          commentInput.focus();
          return;
        }

        submitRevBtn.disabled = true;
        submitRevBtn.innerHTML = '<span>⏳ Publishing Blessing...</span>';

        // Add review to store with optional attached customer unboxing photo & avatar
        productStore.addReview(product.id, {
          name,
          city: city || 'Verified Patron',
          title,
          comment,
          rating,
          avatarUrl: uploadedAvatarBase64 || '',
          photoUrl: uploadedImageBase64 || '',
          verified: true
        });

        setTimeout(() => {
          // Re-render product detail with new review and update ratings
          this.renderProductDetail(product.id);
          const revSection = this.container.querySelector('#reviews-section');
          if (revSection) revSection.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      });
    }

    // Reviews Carousel Arrow Controls
    const carouselTrack = mainContent.querySelector('#reviews-carousel-track');
    const prevBtn = mainContent.querySelector('#rev-carousel-prev');
    const nextBtn = mainContent.querySelector('#rev-carousel-next');

    if (carouselTrack && prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: -340, behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        carouselTrack.scrollBy({ left: 340, behavior: 'smooth' });
      });
    }
  }

  bindEvents() {
    // Top-level handlers if any
  }

  hide(syncHash = true) {
    this.activeProductId = null;
    const wrapper = this.container.querySelector('#ecom-product-page-wrapper');
    if (wrapper) wrapper.style.display = 'none';

    if (syncHash && (window.location.hash.startsWith('#/products') || window.location.hash.startsWith('#/product/'))) {
      history.pushState(null, '', '#/');
    }
  }

  getCategoryName(cat) {
    return productStore.getCategoryDisplayName(cat);
  }

  formatCurrency(inr, usd) {
    if (this.currentCurrency === 'USD') {
      return `$${usd || Math.round(inr * 0.012)}`;
    }
    return `₹${inr.toLocaleString('en-IN')}`;
  }
}
