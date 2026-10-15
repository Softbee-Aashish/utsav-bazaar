// Flipkart / Amazon E-Commerce Product Listing & Full Product Detail Page Component
import { productStore } from '../engine/ProductStore.js';

export class ProductPage {
  constructor(container, onAddToCart, onBuyNow) {
    this.container = container;
    this.onAddToCart = onAddToCart;
    this.onBuyNow = onBuyNow;
    this.currentCurrency = 'INR';
    this.selectedCategory = 'all';
    this.priceFilter = 'all'; // 'all', 'under500', 'under1000', 'under2500', 'under5000', 'above5000'
    this.ratingFilter = 0; // 0, 4, 3
    this.stockOnly = false;
    this.searchQuery = '';
    this.sortOption = 'featured'; // 'featured', 'price-low', 'price-high', 'rating'
    this.activeProductId = null; // null => catalog grid, 'ub-xxx' => detail page
    this.selectedImageIdx = 0;
    this.selectedQuantity = 1;

    this.init();
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

    mainContent.innerHTML = `
      <!-- Top Amazon / Flipkart Style Breadcrumb & Results Bar -->
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
        <!-- Left Sidebar Filter (Amazon / Flipkart layout) -->
        <aside class="ecom-filter-sidebar">
          <div class="filter-group">
            <h4 class="filter-title">Category</h4>
            <ul class="filter-list">
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="all" ${this.selectedCategory === 'all' ? 'checked' : ''} /> <span>All Categories</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="diyas" ${this.selectedCategory === 'diyas' ? 'checked' : ''} /> <span>Royal Brass Diyas</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="decor" ${this.selectedCategory === 'decor' ? 'checked' : ''} /> <span>Urlis & Home Decor</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="apparel" ${this.selectedCategory === 'apparel' ? 'checked' : ''} /> <span>Royal Silk & Attire</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="torans" ${this.selectedCategory === 'torans' ? 'checked' : ''} /> <span>Torans & Wall Hangings</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="lanterns" ${this.selectedCategory === 'lanterns' ? 'checked' : ''} /> <span>Jali Lanterns</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="hampers" ${this.selectedCategory === 'hampers' ? 'checked' : ''} /> <span>Festive Hampers</span></label></li>
              <li><label class="filter-radio"><input type="radio" name="ecom-cat" value="heirlooms" ${this.selectedCategory === 'heirlooms' ? 'checked' : ''} /> <span>Artisanal Heirlooms</span></label></li>
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
              <span>Utsav Express Delivery</span>
            </div>
            <div class="filter-feature-note">Free Premium Gift Packaging & Insured Delivery with every order.</div>
          </div>
        </aside>

        <!-- Right Product Cards Grid (Flipkart / Amazon card format) -->
        <main class="ecom-cards-stream" id="ecom-cards-stream">
          <!-- Filled by renderCatalogList() -->
        </main>
      </div>
    `;

    this.renderCatalogList();
    this.bindListingEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    if (list.length === 0) {
      stream.innerHTML = `
        <div class="ecom-no-results">
          <div class="no-res-diya">🪔</div>
          <h3>No Offerings Found</h3>
          <p>Try clearing some filters or searching for brass diyas, urlis, or silk attire.</p>
          <button class="ecom-reset-filter-btn" id="btn-reset-filters">Reset All Filters</button>
        </div>
      `;
      const rst = stream.querySelector('#btn-reset-filters');
      if (rst) {
        rst.addEventListener('click', () => {
          this.selectedCategory = 'all';
          this.priceFilter = 'all';
          this.ratingFilter = 0;
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
          <div class="hero-banner-tag">✦ UTSAV BAZAAR CURATED COLLECTION ✦</div>
          <h2 class="hero-banner-title">${currentTitle}</h2>
          <p class="hero-banner-desc">${currentHeroDesc}</p>
        </div>
        <div class="hero-banner-stats">
          <div class="banner-stat-pill">✨ ${list.length} Offerings Available</div>
          <div class="banner-stat-pill">👑 100% Artisan Certified</div>
          <div class="banner-stat-pill">🚀 Free Express Shipping</div>
        </div>
      </div>

      <!-- Flipkart / Amazon Products Grid -->
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

    return `
      <div class="ecom-product-card" data-card-id="${p.id}">
        <!-- Image Container -->
        <div class="ecom-card-media" data-click-action="view-detail" data-id="${p.id}">
          <img src="${imgUrl}" alt="${p.name}" class="ecom-card-img" loading="lazy" onerror="this.src='/assets/products/diya_peacock.jpg';" />
          <span class="ecom-badge-tag">${p.badge || 'Limited Edition'}</span>
        </div>

        <!-- Product Content -->
        <div class="ecom-card-details">
          <div class="ecom-card-title-row">
            <h3 class="ecom-card-title" data-click-action="view-detail" data-id="${p.id}" title="${p.name}">
              ${p.name}
            </h3>
          </div>

          <!-- Rating Row -->
          <div class="ecom-card-rating">
            <span class="rating-stars">${'★'.repeat(Math.floor(p.rating || 5))}☆</span>
            <span class="rating-score">${p.rating || 4.9}</span>
            <span class="rating-reviews">(${p.reviewsCount || 120})</span>
          </div>

          <!-- Limited Time Deal Tag -->
          <div class="ecom-deal-badge">Limited time deal</div>

          <!-- Price & Discount in Red -->
          <div class="ecom-price-section">
            <span class="ecom-sale-price">${salePriceFormatted}</span>
            ${hasDiscount ? `
              <span class="ecom-mrp-label">M.R.P.:</span>
              <span class="ecom-mrp-strike">${origPriceFormatted}</span>
              <span class="ecom-discount-red">(${discountPercent}% off)</span>
            ` : ''}
          </div>

          <div class="ecom-delivery-line">
            <span class="bazaar-tag">bazaar</span> <span class="crazy-price-tag">Crazy Prices</span>
          </div>
          <div class="ecom-free-delivery">FREE delivery <strong>Tomorrow</strong></div>

          <!-- Card Actions: Yellow Add to Cart Button -->
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
    const reviews = productStore.getProductReviews(product.id);

    mainContent.innerHTML = `
      <!-- Amazon / Flipkart Style Breadcrumb -->
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
              <div class="zoom-lens" id="zoom-lens"></div>
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
            <span class="detail-stars">${'★'.repeat(Math.floor(product.rating || 5))}☆</span>
            <span class="detail-rating-num">${product.rating || 4.9}</span>
            <a href="#reviews-section" class="detail-review-count">(${product.reviewsCount || 120} customer ratings)</a>
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
                <p>Upto 15% discount on HDFC & SBI Credit Cards with code <strong>DIWALI2026</strong></p>
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
              <div>FREE delivery <strong>Saturday, 24 October</strong>. <a href="#">Details</a></div>
              <div class="fastest-delivery">Or fastest delivery <strong>Tomorrow</strong>.</div>
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
              <div class="meta-row"><span>Ships from:</span> <strong>Utsav Bazaar Express</strong></div>
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
              <div class="r-bar-track"><div class="r-bar-fill" style="width: 88%;"></div></div>
              <span>88%</span>
            </div>
            <div class="rating-bar-row">
              <span>4 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: 10%;"></div></div>
              <span>10%</span>
            </div>
            <div class="rating-bar-row">
              <span>3 star</span>
              <div class="r-bar-track"><div class="r-bar-fill" style="width: 2%;"></div></div>
              <span>2%</span>
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

              <!-- Raw Image Upload with Drag & Drop and Preview -->
              <div class="form-group review-upload-group">
                <label>Add Photos / Raw Images of the Product (Customer Unboxing)</label>
                <div class="review-upload-dropzone" id="review-upload-dropzone">
                  <input type="file" id="review-image-input" accept="image/*" class="file-hidden-input" />
                  <div class="dropzone-content">
                    <span class="upload-cam-icon">📷</span>
                    <span class="upload-prompt-text"><strong>Click to upload</strong> or drag & drop customer photo</span>
                    <small>Supports PNG, JPG, WebP, or raw camera photos</small>
                  </div>
                </div>
                <!-- Image Preview Container -->
                <div class="review-image-preview-bar" id="review-image-preview-bar" style="display: none;">
                  <img id="review-preview-img" src="" alt="Customer uploaded preview" />
                  <div class="preview-info">
                    <span id="preview-filename">photo.jpg</span>
                    <button type="button" class="btn-remove-preview" id="btn-remove-preview">✕ Remove</button>
                  </div>
                </div>
              </div>

              <div class="form-action-row">
                <button type="button" class="btn-submit-customer-review" id="btn-submit-review">
                  <span>Submit Verified Review & Photos</span>
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
                ${reviews.length > 0 ? reviews.map(r => `
                  <div class="review-item-card carousel-slide-card">
                    <div class="r-author-row">
                      <span class="r-avatar">👤</span>
                      <strong>${r.name}</strong>
                      <span class="r-verified-pill">✓ Verified</span>
                    </div>
                    <div class="r-rating-line">
                      <span class="r-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))}</span>
                      <span class="r-rating-val">${r.rating || 5}.0</span>
                      <span class="r-date">${r.date || 'Recent'}</span>
                    </div>
                    <p class="r-text">${r.comment}</p>
                    ${r.imageUrl ? `
                      <div class="review-attached-photo">
                        <img src="${r.imageUrl}" alt="Customer photo" class="r-customer-uploaded-img" onclick="window.open(this.src, '_blank')" title="Click to view full photo" />
                      </div>
                    ` : ''}
                  </div>
                `).join('') : `
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
      </div>
    `;

    this.bindDetailEvents(product);
  }

  bindListingEvents() {
    const mainContent = this.container.querySelector('#ecom-main-content');
    if (!mainContent) return;

    // Category radios
    mainContent.querySelectorAll('input[name="ecom-cat"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedCategory = e.target.value;
        this.renderCatalogList();
      });
    });

    // Price radios
    mainContent.querySelectorAll('input[name="ecom-price"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.priceFilter = e.target.value;
        this.renderCatalogList();
      });
    });

    // Rating radios
    mainContent.querySelectorAll('input[name="ecom-rating"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.ratingFilter = parseFloat(e.target.value);
        this.renderCatalogList();
      });
    });

    // Stock checkbox
    const stockCheck = mainContent.querySelector('#ecom-stock-check');
    if (stockCheck) {
      stockCheck.addEventListener('change', (e) => {
        this.stockOnly = e.target.checked;
        this.renderCatalogList();
      });
    }

    // Sort select
    const sortSelect = mainContent.querySelector('#ecom-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortOption = e.target.value;
        this.renderCatalogList();
      });
    }

    // Card click delegation (view detail or add to cart)
    const stream = mainContent.querySelector('#ecom-cards-stream');
    if (stream) {
      stream.addEventListener('click', (e) => {
        const detailTrigger = e.target.closest('[data-click-action="view-detail"]');
        const addBtn = e.target.closest('[data-action="quick-add"]');

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

    // Back to catalog crumb
    const backBtn = mainContent.querySelector('#crumb-back-catalog');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showListing(this.selectedCategory);
      });
    }

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

    // Thumbnail switching & sync zoom images / video display
    mainContent.querySelectorAll('.thumb-box').forEach(thumb => {
      const switchMedia = () => {
        mainContent.querySelectorAll('.thumb-box').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
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

    // Submit Review Handler
    const submitRevBtn = mainContent.querySelector('#btn-submit-review');
    if (submitRevBtn) {
      submitRevBtn.addEventListener('click', () => {
        const nameInput = mainContent.querySelector('#rev-input-name');
        const commentInput = mainContent.querySelector('#rev-input-comment');
        const name = nameInput ? nameInput.value.trim() : '';
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

        // Add review to store with optional attached customer raw photo
        productStore.addReview(product.id, {
          name,
          comment,
          rating,
          imageUrl: uploadedImageBase64 || null
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
