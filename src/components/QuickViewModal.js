// Quick View Modal Component for Utsav Bazaar
import { productStore } from '../engine/ProductStore.js';

export class QuickViewModal {
  constructor(container, onAddToCart) {
    this.container = container;
    this.onAddToCart = onAddToCart;
    this.product = null;
    this.currentCurrency = 'INR';

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-backdrop" id="qv-backdrop"></div>
      <div class="modal-dialog-panel" id="qv-panel" role="dialog" aria-modal="true">
        <button class="modal-close-icon" id="qv-close-btn" aria-label="Close dialog">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>

        <div class="modal-body-grid" id="qv-body">
          <!-- Injected dynamically -->
        </div>
      </div>
    `;
  }

  bindEvents() {
    const backdrop = this.container.querySelector('#qv-backdrop');
    const closeBtn = this.container.querySelector('#qv-close-btn');

    if (backdrop) backdrop.addEventListener('click', () => this.close());
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Currency update
    window.addEventListener('currency-changed', (e) => {
      this.currentCurrency = e.detail.currency;
      if (this.product) this.renderContent(this.product);
    });

    // Add to cart delegation
    const body = this.container.querySelector('#qv-body');
    if (body) {
      body.addEventListener('click', (e) => {
        const addBtn = e.target.closest('#qv-add-cart-btn');
        if (addBtn && this.product && this.onAddToCart) {
          this.onAddToCart(this.product);
          this.close();
        }

        const addRevBtn = e.target.closest('#qv-submit-quick-rev');
        if (addRevBtn && this.product) {
          const nameInput = this.container.querySelector('#qv-rev-name');
          const commentInput = this.container.querySelector('#qv-rev-comment');
          const ratingInput = this.container.querySelector('#qv-rev-stars');

          const name = nameInput ? nameInput.value.trim() : '';
          const comment = commentInput ? commentInput.value.trim() : '';
          const rating = ratingInput ? ratingInput.value : 5;

          if (!comment) {
            alert("Please enter a short review commentary.");
            return;
          }

          productStore.addReview(this.product.id, { name, comment, rating });
          // Refresh content
          const updated = productStore.getProductById(this.product.id);
          this.renderContent(updated || this.product);
        }
      });
    }

    window.addEventListener('reviews-updated', () => {
      if (this.product) {
        const updated = productStore.getProductById(this.product.id);
        this.renderContent(updated || this.product);
      }
    });
  }

  open(product) {
    this.product = product;
    this.renderContent(product);
    this.container.querySelector('#qv-panel').classList.add('visible');
    this.container.querySelector('#qv-backdrop').classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.product = null;
    this.container.querySelector('#qv-panel').classList.remove('visible');
    this.container.querySelector('#qv-backdrop').classList.remove('visible');
    document.body.style.overflow = '';
  }

  renderContent(p) {
    const body = this.container.querySelector('#qv-body');
    if (!body) return;

    let priceFormatted = `₹${p.priceINR.toLocaleString('en-IN')}`;
    let origPriceFormatted = p.originalPriceINR ? `₹${p.originalPriceINR.toLocaleString('en-IN')}` : '';

    if (this.currentCurrency === 'USD') {
      priceFormatted = `$${p.priceUSD || Math.round(p.priceINR * 0.012)}`;
      origPriceFormatted = p.originalPriceINR ? `$${Math.round(p.originalPriceINR * 0.012)}` : '';
    }

    const hasDiscount = p.originalPriceINR && p.originalPriceINR > p.priceINR;
    const discountPercent = p.discountPercent || (hasDiscount ? Math.round(((p.originalPriceINR - p.priceINR) / p.originalPriceINR) * 100) : 0);
    const savingsINR = hasDiscount ? (p.originalPriceINR - p.priceINR) : 0;

    const hasRealImage = !!(p.imageUrl && p.imageUrl.trim().length > 5);
    const reviews = productStore.getProductReviews(p.id);

    body.innerHTML = `
      <div class="qv-left-media" style="background: radial-gradient(circle at center, ${p.accentColor || '#D4AF37'}22 0%, #000 70%);">
        <span class="qv-badge">${p.badge || 'Festive Offering'}</span>
        <div class="qv-art-container">
          ${hasRealImage ? `
            <img src="${p.imageUrl}" class="qv-real-image-preview" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="qv-floating-symbol" style="display:none;">🪔</div>
          ` : `
            <div class="qv-floating-symbol">🪔</div>
          `}
          <div class="qv-origin-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Handcrafted in ${p.origin || 'India'}</span>
          </div>
        </div>
      </div>

      <div class="qv-right-details">
        <div class="qv-category">${p.categoryName || p.category}</div>
        <h3 class="qv-title">${p.name}</h3>
        <p class="qv-tagline">${p.tagline}</p>

        <div class="qv-rating-row">
          <span class="stars">★★★★★</span>
          <span class="score">${p.rating} / 5.0</span>
          <span class="count">(${p.reviewsCount} verified festive orders)</span>
        </div>

        <div class="qv-price-row">
          <div class="qv-price-main">
            <span class="qv-price">${priceFormatted}</span>
            ${hasDiscount ? `
              <span class="qv-orig-price">${origPriceFormatted}</span>
              <span class="qv-discount-tag">-${discountPercent}% OFF</span>
            ` : ''}
          </div>
          <span class="qv-tax-note">Sacred gift box packaging included</span>
        </div>

        ${hasDiscount ? `
          <div class="qv-savings-banner">
            ✨ Auspicious Festive Savings: You save ₹${savingsINR.toLocaleString('en-IN')} (${discountPercent}%) today!
          </div>
        ` : ''}

        <p class="qv-description">${p.description}</p>

        <div class="qv-craft-specs">
          <h4>Craftsmanship & Materials:</h4>
          ${p.material ? `<p><strong>Primary Material:</strong> ${p.material}</p>` : ''}
          <ul class="qv-feature-list">
            ${(p.features || ["Handcrafted by master Indian artisans", "Blessed festive packaging"]).map(f => `<li><span>✦</span> ${f}</li>`).join('')}
          </ul>
        </div>

        <!-- Real Customer Reviews Section -->
        <div class="qv-reviews-section">
          <div class="qv-rev-title-row">
            <h4>Customer Blessings & Reviews (${reviews.length})</h4>
          </div>

          <div class="qv-rev-list">
            ${reviews.length > 0 ? reviews.map(r => `
              <div class="qv-rev-item">
                <div class="rev-item-head">
                  <span class="rev-author">${r.name}</span>
                  <span class="rev-stars">${'★'.repeat(r.rating)}</span>
                  <span class="rev-time">${r.date}</span>
                  <span class="rev-verified">✓ Verified Buyer</span>
                </div>
                <p class="rev-text">"${r.comment}"</p>
              </div>
            `).join('') : `
              <div class="no-rev-notice">No reviews yet. Be the first to bless this offering!</div>
            `}
          </div>

          <!-- Quick Review Form -->
          <div class="qv-add-review-box">
            <h5>Leave a Festive Blessing / Review</h5>
            <div class="rev-input-row">
              <input type="text" id="qv-rev-name" placeholder="Your Name (e.g. Radhika Sharma)" class="rev-mini-input" />
              <select id="qv-rev-stars" class="rev-mini-select">
                <option value="5">★★★★★ (5 Stars)</option>
                <option value="4">★★★★☆ (4 Stars)</option>
                <option value="3">★★★☆☆ (3 Stars)</option>
              </select>
            </div>
            <textarea id="qv-rev-comment" placeholder="Write your review or festive wishes..." class="rev-mini-textarea" rows="2"></textarea>
            <button class="rev-submit-btn" id="qv-submit-quick-rev">Post Blessing</button>
          </div>
        </div>

        <div class="qv-actions" style="margin-top: 24px;">
          <button class="qv-add-btn ${!p.inStock ? 'disabled-btn' : ''}" id="qv-add-cart-btn" ${!p.inStock ? 'disabled' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <span>${p.inStock ? `Add to Festive Thali • ${priceFormatted}` : 'Sold Out'}</span>
          </button>
        </div>
      </div>
    `;
  }
}
