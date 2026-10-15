// Festive Marketplace Catalog & Product Grid for Utsav Bazaar
import { FESTIVAL_HIGHLIGHTS } from './ProductData.js';
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
  }

  render() {
    this.container.innerHTML = `
      <section class="bazaar-storefront" id="bazaar-storefront">
        <!-- Festive Marketplace Header & Home Decor Pavilion Intro -->
        <div class="storefront-header">
          <div class="header-pre-title">
            <span class="golden-sparkle">✦</span>
            <span>DIWALI & FESTIVE SEASON 2026 • उत्सव बाज़ार</span>
            <span class="golden-sparkle">✦</span>
          </div>
          <h2 class="storefront-main-title">The Royal Indian Festive Home Decor & Silk Attire Pavilion</h2>
          <p class="storefront-sub">
            Transform your sanctuary and celebrate in regal splendor: Handcrafted Moradabad solid brass diyas, carved floral urlis, pure Varanasi handloom silk kurtas, royal zardozi door torans, mughal jali lanterns, and sacred pooja heirlooms.
          </p>

          <!-- Featured Home Decor Spotlight Banner -->
          <div class="story-spotlight-banner" style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(14, 10, 20, 0.85) 100%); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 16px; padding: 20px 28px; margin: 24px auto 32px; max-width: 900px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div class="spotlight-vector-icon" style="width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(20, 14, 28, 0.9) 70%); border: 1.5px solid #D4AF37; display: flex; align-items: center; justify-content: center; color: #FFD700; flex-shrink: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h16M4 14h16M6 6h12l-1 12H7L6 6zM9 2h6v4H9V2z"/></svg>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 11px; letter-spacing: 0.15em; color: #FFDF73; font-weight: 700; text-transform: uppercase;">Featured Masterpiece • राजसी सजावट</div>
                <div style="font-family: var(--font-serif-royal); font-size: 18px; color: #FFF; font-weight: 600;">Royal Hand-Hammered Brass Lotus Urli & Floating Diya Set</div>
                <div style="font-size: 13px; color: #CBD5E1; margin-top: 2px;">The quintessential centerpiece for courtyard and living room rangolis, with floating brass petal diyas.</div>
              </div>
            </div>
            <button class="cta-gold-btn" data-action="quickview" data-id="ub-006" style="padding: 10px 20px; font-size: 12px; cursor: pointer;">
              <span>View Decor Masterpiece</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Festival Highlights Carousel / Pills -->
          <div class="festival-highlights-row">
            ${FESTIVAL_HIGHLIGHTS.map(h => `
              <div class="festival-highlight-card">
                <span class="fest-icon">${h.icon}</span>
                <div class="fest-text">
                  <strong>${h.title}</strong>
                  <span>${h.description}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Category Filter Bar -->
          <div class="category-filter-bar">
            <button class="cat-filter-btn active" data-category="all">All Offerings</button>
            <button class="cat-filter-btn" data-category="decor">Urlis & Home Decor</button>
            <button class="cat-filter-btn" data-category="apparel">Royal Silk & Attire</button>
            <button class="cat-filter-btn" data-category="diyas">Royal Brass Diyas</button>
            <button class="cat-filter-btn" data-category="torans">Torans & Hangings</button>
            <button class="cat-filter-btn" data-category="lanterns">Jali Lanterns</button>
            <button class="cat-filter-btn" data-category="hampers">Festive Hampers</button>
            <button class="cat-filter-btn" data-category="heirlooms">Artisanal Heirlooms</button>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="product-catalog-grid" id="product-grid">
          ${this.renderProductCards()}
        </div>

        <!-- Heritage & Artisan Trust Section -->
        <div class="artisan-heritage-banner" id="heritage-section">
          <div class="heritage-content">
            <span class="heritage-badge">GENUINE HERITAGE</span>
            <h3 class="heritage-title">Reviving 400 Years of Indian Metalcraft & Silk Art</h3>
            <p class="heritage-text">
              Every brass diya, lacquered hamper, and kundan medallion at Utsav Bazaar is directly sourced from generational artisan families across Moradabad, Jaipur, and Bikaner. No mass factory shortcuts—only pure metal, sacred ingredients, and unmatched heritage.
            </p>
            <div class="heritage-stats-grid">
              <div class="stat-item">
                <span class="stat-number">120+</span>
                <span class="stat-label">Artisan Families Supported</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">100%</span>
                <span class="stat-label">Virgin Solid Brass & Silk</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">4.96 ★</span>
                <span class="stat-label">Customer Blessing Score</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">Eco</span>
                <span class="stat-label">Zero-Emission Packaging</span>
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
      : allProducts.filter(p => p.category === this.activeCategory);

    return filtered.map(product => {
      const priceText = this.formatPrice(product.priceINR, product.priceUSD);
      const hasDiscount = product.originalPriceINR && product.originalPriceINR > product.priceINR;
      const originalPriceText = hasDiscount ? this.formatPrice(product.originalPriceINR, Math.round(product.originalPriceINR * 0.012)) : '';
      const discountPercent = product.discountPercent || (hasDiscount ? Math.round(((product.originalPriceINR - product.priceINR) / product.originalPriceINR) * 100) : 0);

      const hasRealImage = !!(product.imageUrl && product.imageUrl.trim().length > 5);

      return `
        <article class="product-card" data-product-id="${product.id}">
          <div class="product-visual-wrapper">
            <span class="product-badge">${product.badge || 'Festive Special'}</span>
            <div class="artisan-origin">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${product.origin || 'India'}</span>
            </div>
            
            <!-- Dynamic Artwork: Real Photo or Procedural SVG -->
            <div class="product-art-preview">
              ${hasRealImage ? `
                <img src="${product.imageUrl}" class="product-real-img" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div class="product-svg-fallback" style="display:none; width:100%; height:100%; align-items:center; justify-content:center;">
                  ${this.getProductSvgIllustration(product.svgIcon, product.accentColor)}
                </div>
              ` : `
                ${this.getProductSvgIllustration(product.svgIcon, product.accentColor)}
              `}
            </div>

            <button class="quick-view-overlay-btn" data-action="quickview" data-id="${product.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>Quick View</span>
            </button>
          </div>

          <div class="product-info-wrapper">
            <div class="product-category-tag">${product.categoryName || product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-tagline">${product.tagline}</p>
            
            <div class="product-rating-row">
              <span class="stars">★★★★★</span>
              <span class="score">${product.rating}</span>
              <span class="count">(${product.reviewsCount} reviews)</span>
            </div>

            <div class="product-bottom-row">
              <div class="price-container">
                <div class="price-strike-row">
                  <span class="price-amount">${priceText}</span>
                  ${hasDiscount ? `
                    <span class="price-original-strikethrough">${originalPriceText}</span>
                    <span class="discount-badge-pill">-${discountPercent}%</span>
                  ` : ''}
                </div>
                <span class="tax-info">Taxes & Sacred Packaging Incl.</span>
              </div>

              <button class="add-to-cart-btn ${!product.inStock ? 'disabled-btn' : ''}" data-action="${product.inStock ? 'add' : 'soldout'}" data-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                <span>${product.inStock ? 'Add to Thali' : 'Sold Out'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  formatPrice(inr, usd) {
    switch (this.currentCurrency) {
      case 'USD':
        return `$${usd || Math.round(inr * 0.012)}`;
      case 'EUR':
        return `€${Math.round((usd || (inr * 0.012)) * 0.92)}`;
      case 'GBP':
        return `£${Math.round((usd || (inr * 0.012)) * 0.79)}`;
      case 'INR':
      default:
        return `₹${Math.round(inr).toLocaleString('en-IN')}`;
    }
  }

  getProductSvgIllustration(iconType, accent) {
    switch (iconType) {
      case 'diya':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="diyaGlow" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stop-color="#FFD700" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#FF6B00" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
              </radialGradient>
              <linearGradient id="brassGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FFF3B0"/>
                <stop offset="50%" stop-color="#D4AF37"/>
                <stop offset="100%" stop-color="#996515"/>
              </linearGradient>
            </defs>
            <circle cx="120" cy="100" r="85" fill="url(#diyaGlow)"/>
            <!-- Diya Body -->
            <path d="M40 140 C40 190, 200 190, 200 140 C170 140, 160 160, 120 160 C80 160, 70 140, 40 140 Z" fill="url(#brassGrad)" stroke="#FFD700" stroke-width="3"/>
            <!-- Peacock Finial Handle -->
            <path d="M170 140 Q210 110 195 80 Q180 50 165 70 Q150 90 160 115" stroke="url(#brassGrad)" stroke-width="7" stroke-linecap="round"/>
            <circle cx="195" cy="80" r="10" fill="#0E4D44"/>
            <!-- Flame -->
            <path d="M110 140 Q105 100 120 65 Q135 100 130 140 Z" fill="#FFA500"/>
            <path d="M115 135 Q112 110 120 85 Q128 110 125 135 Z" fill="#FFF"/>
            <!-- Pedestal -->
            <path d="M90 180 L150 180 L160 195 L80 195 Z" fill="#996515"/>
          </svg>
        `;
      case 'hamper':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="velvetGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#C9184A"/>
                <stop offset="50%" stop-color="#800F2F"/>
                <stop offset="100%" stop-color="#470014"/>
              </linearGradient>
              <linearGradient id="goldRibbon" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#FFE082"/>
                <stop offset="50%" stop-color="#FFD700"/>
                <stop offset="100%" stop-color="#B8860B"/>
              </linearGradient>
            </defs>
            <!-- Chest Base -->
            <rect x="45" y="100" width="150" height="90" rx="10" fill="url(#velvetGrad)" stroke="#FFD700" stroke-width="3"/>
            <!-- Lid -->
            <path d="M40 100 L120 70 L200 100 L195 115 L45 115 Z" fill="url(#velvetGrad)" stroke="#FFD700" stroke-width="2"/>
            <!-- Gold Foil Zardozi Bands -->
            <rect x="110" y="70" width="20" height="120" fill="url(#goldRibbon)"/>
            <rect x="45" y="135" width="150" height="16" fill="url(#goldRibbon)"/>
            <!-- Brass Lock Clasp -->
            <circle cx="120" cy="143" r="14" fill="#D4AF37" stroke="#FFE082" stroke-width="2"/>
            <circle cx="120" cy="143" r="4" fill="#470014"/>
          </svg>
        `;
      case 'lantern':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lanternAmber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FFF" stop-opacity="1"/>
                <stop offset="40%" stop-color="#FFB703" stop-opacity="0.8"/>
                <stop offset="100%" stop-color="#FB8500" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <!-- Hanging Chain -->
            <line x1="120" y1="15" x2="120" y2="65" stroke="#D4AF37" stroke-width="3" stroke-dasharray="4 4"/>
            <!-- Lantern Dome -->
            <path d="M85 65 Q120 40 155 65 L165 85 L75 85 Z" fill="#D4AF37"/>
            <!-- Glass Core & Jali -->
            <rect x="75" y="85" width="90" height="95" rx="6" fill="#1C1004" stroke="#D4AF37" stroke-width="3"/>
            <circle cx="120" cy="132" r="42" fill="url(#lanternAmber)"/>
            <!-- Mughal Jali Cutouts -->
            <circle cx="120" cy="132" r="28" stroke="#D4AF37" stroke-width="2"/>
            <line x1="120" y1="85" x2="120" y2="180" stroke="#D4AF37" stroke-width="2"/>
            <line x1="75" y1="132" x2="165" y2="132" stroke="#D4AF37" stroke-width="2"/>
            <!-- Base & Finial -->
            <path d="M85 180 L155 180 L145 200 L95 200 Z" fill="#D4AF37"/>
            <circle cx="120" cy="210" r="6" fill="#D4AF37"/>
          </svg>
        `;
      case 'jewelry':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Pearl Strand -->
            <path d="M50 50 Q120 140 190 50" stroke="#FFF" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 14"/>
            <!-- Gold Polki Medallion -->
            <path d="M120 85 C145 85 165 105 165 130 C165 165 120 195 120 195 C120 195 75 165 75 130 C75 105 95 85 120 85 Z" fill="#D4AF37" stroke="#FFE082" stroke-width="3"/>
            <!-- Emerald Inlay Core -->
            <circle cx="120" cy="135" r="22" fill="#0E4D44" stroke="#FFF" stroke-width="2"/>
            <!-- Hanging Pearls -->
            <circle cx="120" cy="212" r="8" fill="#FFF"/>
            <circle cx="95" cy="180" r="6" fill="#FFF"/>
            <circle cx="145" cy="180" r="6" fill="#FFF"/>
          </svg>
        `;
      case 'aromatics':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Smoke Plumes -->
            <path d="M120 110 Q105 80 120 60 Q135 40 115 20" stroke="rgba(255,240,220,0.5)" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M135 110 Q150 85 135 65 Q120 45 140 25" stroke="rgba(255,240,220,0.3)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <!-- Brass Tortoise Burner -->
            <ellipse cx="120" cy="170" rx="60" ry="25" fill="#D4AF37" stroke="#996515" stroke-width="2"/>
            <circle cx="60" cy="170" r="10" fill="#996515"/>
            <circle cx="180" cy="170" r="10" fill="#996515"/>
            <!-- Glowing Charcoal / Dhoop Cone -->
            <path d="M110 160 L130 160 L120 120 Z" fill="#800F2F"/>
            <circle cx="120" cy="120" r="4" fill="#FFA500"/>
          </svg>
        `;
      case 'urli':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="brassUrliGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#FFE082"/>
                <stop offset="50%" stop-color="#D4AF37"/>
                <stop offset="100%" stop-color="#8C6D1F"/>
              </linearGradient>
              <radialGradient id="waterSurface" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#48CAE4" stop-opacity="0.8"/>
                <stop offset="70%" stop-color="#0077B6" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#023E8A"/>
              </radialGradient>
            </defs>
            <!-- Urli Bowl Body -->
            <ellipse cx="120" cy="155" rx="85" ry="40" fill="url(#brassUrliGrad)" stroke="#FFD700" stroke-width="2.5"/>
            <ellipse cx="120" cy="148" rx="80" ry="32" fill="url(#waterSurface)"/>
            <!-- Floating Rose Petals -->
            <ellipse cx="90" cy="145" rx="8" ry="5" fill="#E63946" transform="rotate(-15 90 145)"/>
            <ellipse cx="150" cy="152" rx="9" ry="6" fill="#D90429" transform="rotate(25 150 152)"/>
            <ellipse cx="115" cy="162" rx="7" ry="5" fill="#FF758F"/>
            <!-- Floating Center Brass Diya -->
            <ellipse cx="120" cy="144" rx="20" ry="9" fill="#D4AF37" stroke="#FFE082" stroke-width="1.5"/>
            <!-- Glowing Diya Flame -->
            <path d="M120 122 Q125 133 120 140 Q115 133 120 122 Z" fill="#FFD700" filter="drop-shadow(0 0 8px #FFA500)"/>
            <path d="M120 128 Q123 134 120 138 Q117 134 120 128 Z" fill="#FFF"/>
            <!-- Scalloped Lotus Petal Handles -->
            <path d="M35 150 Q22 142 35 134" stroke="#D4AF37" stroke-width="4" stroke-linecap="round" fill="none"/>
            <path d="M205 150 Q218 142 205 134" stroke="#D4AF37" stroke-width="4" stroke-linecap="round" fill="none"/>
            <!-- Pedestal Stand -->
            <ellipse cx="120" cy="188" rx="45" ry="12" fill="url(#brassUrliGrad)" stroke="#B8860B" stroke-width="2"/>
          </svg>
        `;
      case 'toran':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="toranVelvet" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#9B111E"/>
                <stop offset="50%" stop-color="#D90429"/>
                <stop offset="100%" stop-color="#9B111E"/>
              </linearGradient>
            </defs>
            <!-- Velvet Bandhanwar Main Bar -->
            <rect x="20" y="60" width="200" height="26" rx="4" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="2"/>
            <!-- Golden Zari Border Trim -->
            <line x1="20" y1="65" x2="220" y2="65" stroke="#FFE082" stroke-width="2"/>
            <line x1="20" y1="81" x2="220" y2="81" stroke="#FFE082" stroke-width="2"/>
            <!-- Hanging Mango Leaf / Kalash Pennants -->
            <path d="M31 86 L59 86 L45 140 Z" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="1.5"/>
            <circle cx="45" cy="104" r="5" fill="#FFD700"/>
            <circle cx="45" cy="155" r="9" fill="#FFB703"/>
            <circle cx="45" cy="176" r="6" fill="#D4AF37" stroke="#FFE082" stroke-width="1"/>
            <line x1="45" y1="140" x2="45" y2="170" stroke="#D4AF37" stroke-width="1.5"/>

            <path d="M68 86 L96 86 L82 140 Z" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="1.5"/>
            <circle cx="82" cy="104" r="5" fill="#FFD700"/>
            <circle cx="82" cy="155" r="9" fill="#FFB703"/>
            <circle cx="82" cy="176" r="6" fill="#D4AF37" stroke="#FFE082" stroke-width="1"/>
            <line x1="82" y1="140" x2="82" y2="170" stroke="#D4AF37" stroke-width="1.5"/>

            <path d="M106 86 L134 86 L120 140 Z" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="1.5"/>
            <circle cx="120" cy="104" r="5" fill="#FFD700"/>
            <circle cx="120" cy="155" r="9" fill="#FFB703"/>
            <circle cx="120" cy="176" r="6" fill="#D4AF37" stroke="#FFE082" stroke-width="1"/>
            <line x1="120" y1="140" x2="120" y2="170" stroke="#D4AF37" stroke-width="1.5"/>

            <path d="M144 86 L172 86 L158 140 Z" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="1.5"/>
            <circle cx="158" cy="104" r="5" fill="#FFD700"/>
            <circle cx="158" cy="155" r="9" fill="#FFB703"/>
            <circle cx="158" cy="176" r="6" fill="#D4AF37" stroke="#FFE082" stroke-width="1"/>
            <line x1="158" y1="140" x2="158" y2="170" stroke="#D4AF37" stroke-width="1.5"/>

            <path d="M181 86 L209 86 L195 140 Z" fill="url(#toranVelvet)" stroke="#FFD700" stroke-width="1.5"/>
            <circle cx="195" cy="104" r="5" fill="#FFD700"/>
            <circle cx="195" cy="155" r="9" fill="#FFB703"/>
            <circle cx="195" cy="176" r="6" fill="#D4AF37" stroke="#FFE082" stroke-width="1"/>
            <line x1="195" y1="140" x2="195" y2="170" stroke="#D4AF37" stroke-width="1.5"/>

            <!-- Shubh Labh / Auspicious Inscription on Bar -->
            <text x="120" y="78" font-family="'Cinzel', serif" font-size="11" font-weight="bold" fill="#FFE082" text-anchor="middle" letter-spacing="3">॥ शुभ लाभ ॥</text>
          </svg>
        `;
      case 'apparel':
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="kurtaSilk" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#FFD166"/>
                <stop offset="50%" stop-color="#E5A93C"/>
                <stop offset="100%" stop-color="#996515"/>
              </linearGradient>
              <linearGradient id="stoleZari" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#D90429"/>
                <stop offset="70%" stop-color="#9B111E"/>
                <stop offset="100%" stop-color="#470014"/>
              </linearGradient>
            </defs>
            <!-- Silk Kurta Torso Silhouette -->
            <path d="M75 55 L95 40 L145 40 L165 55 L190 75 L175 105 L160 92 L165 200 L75 200 L80 92 L65 105 L50 75 Z" fill="url(#kurtaSilk)" stroke="#FFD700" stroke-width="2"/>
            <!-- Mandarin Collar -->
            <path d="M102 40 Q120 48 138 40 L134 56 Q120 62 106 56 Z" fill="#996515" stroke="#FFE082" stroke-width="1.5"/>
            <!-- Center Button Placket -->
            <rect x="117" y="58" width="6" height="65" fill="#FFE082"/>
            <circle cx="120" cy="68" r="2.5" fill="#470014"/>
            <circle cx="120" cy="82" r="2.5" fill="#470014"/>
            <circle cx="120" cy="96" r="2.5" fill="#470014"/>
            <circle cx="120" cy="110" r="2.5" fill="#470014"/>
            <!-- Draped Brocade Stole (Dupatta across shoulder) -->
            <path d="M85 45 Q70 110 82 205 L106 205 Q98 120 110 52 Z" fill="url(#stoleZari)" stroke="#FFD700" stroke-width="1.5"/>
            <line x1="82" y1="195" x2="106" y2="195" stroke="#FFE082" stroke-width="2.5"/>
            <!-- Golden Tassels on Stole -->
            <line x1="86" y1="205" x2="86" y2="215" stroke="#FFD700" stroke-width="2"/>
            <line x1="94" y1="205" x2="94" y2="215" stroke="#FFD700" stroke-width="2"/>
            <line x1="102" y1="205" x2="102" y2="215" stroke="#FFD700" stroke-width="2"/>
          </svg>
        `;
      default:
        return `
          <svg viewBox="0 0 240 240" class="product-svg-asset" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="120" cy="150" rx="70" ry="25" fill="#D4AF37" stroke="#B8860B" stroke-width="2"/>
            <path d="M120 90 Q135 125 120 145 Q105 125 120 90 Z" fill="#FFD700" filter="drop-shadow(0 0 10px #FF9F1C)"/>
            <path d="M120 105 Q128 128 120 140 Q112 128 120 105 Z" fill="#FFF"/>
            <ellipse cx="120" cy="180" rx="45" ry="12" fill="#996515"/>
          </svg>
        `;
    }
  }

  bindEvents() {
    // Category filters
    this.container.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-category');
        this.updateProductGrid();
      });
    });

    // Product Card Actions (Event delegation)
    const grid = this.container.querySelector('#product-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        // 1. If clicked specifically on Add to Thali, handle cart addition
        const addBtn = e.target.closest('[data-action="add"]');
        if (addBtn) {
          e.stopPropagation();
          const id = addBtn.getAttribute('data-id');
          const product = productStore.getProductById(id);
          if (product && this.onAddToCart) {
            this.onAddToCart(product);

            // Button bounce & feedback
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = `<span>✓ Added to Thali</span>`;
            addBtn.classList.add('added');
            setTimeout(() => {
              addBtn.innerHTML = originalText;
              addBtn.classList.remove('added');
            }, 1200);
          }
          return;
        }

        // 2. Clicking anywhere inside the product box/card opens the product view modal
        const card = e.target.closest('.product-card');
        if (card) {
          const id = card.getAttribute('data-product-id');
          const product = productStore.getProductById(id);
          if (product && this.onQuickView) {
            this.onQuickView(product);
          }
        }
      });
    }

    // Featured Home Decor Spotlight Banner Quick View
    const storyBannerBtn = this.container.querySelector('.story-spotlight-banner [data-action="quickview"]');
    if (storyBannerBtn) {
      storyBannerBtn.addEventListener('click', () => {
        const id = storyBannerBtn.getAttribute('data-id');
        const product = productStore.getProductById(id);
        if (product && this.onQuickView) {
          this.onQuickView(product);
        }
      });
    }

    // Products updated listener (from Admin Panel or Google Sheets)
    window.addEventListener('products-updated', () => {
      this.updateProductGrid();
    });

    // Currency change listener
    window.addEventListener('currency-changed', (e) => {
      this.currentCurrency = e.detail.currency;
      this.updateProductGrid();
    });
  }

  updateProductGrid() {
    const grid = this.container.querySelector('#product-grid');
    if (grid) {
      grid.innerHTML = this.renderProductCards();
    }
  }
}
