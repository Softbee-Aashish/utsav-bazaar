// High-End Luxury Navbar with Top Festive Announcement Bar & Merchant Admin for Utsav Bazaar
import { productStore } from '../engine/ProductStore.js';

export class Navbar {
  constructor(container, soundManager, onCartClick, onAdminClick) {
    this.container = container;
    this.soundManager = soundManager;
    this.onCartClick = onCartClick;
    this.onAdminClick = onAdminClick;
    this.cartCount = 0;
    this.currentCurrency = 'INR';
    this.discountSettings = productStore.discountSettings;

    this.currencies = [
      { code: 'INR', symbol: '₹', rate: 1 },
      { code: 'USD', symbol: '$', rate: 0.012 },
      { code: 'EUR', symbol: '€', rate: 0.011 },
      { code: 'GBP', symbol: '£', rate: 0.0095 }
    ];

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <!-- Top Glowing Festive Announcement & Discount Bar -->
      <div class="festive-announcement-bar" id="festive-discount-bar" style="${this.discountSettings.enabled ? 'display:flex;' : 'display:none;'}">
        <div class="marquee-content">
          <span class="bar-sparkle">✦</span>
          <span class="bar-text" id="announcement-bar-text">${this.discountSettings.text}</span>
          <button class="bar-coupon-pill" id="bar-copy-coupon-btn" title="Click to copy coupon code">
            <span>USE CODE:</span> <strong id="announcement-coupon-code">${this.discountSettings.couponCode}</strong>
            <span class="copy-tag">📋 Copy</span>
          </button>
          <span class="bar-sparkle">✦</span>
        </div>
      </div>

      <header class="luxury-navbar" id="main-nav">
        <div class="nav-left">
          <a href="#" class="brand-link" id="nav-brand-home">
            <span class="brand-diya-glow">🪔</span>
            <div class="brand-titles">
              <span class="brand-primary">UTSAV BAZAAR</span>
              <span class="brand-secondary">उत्सव बाज़ार • 2026</span>
            </div>
          </a>
        </div>

        <nav class="nav-center">
          <a href="#bazaar-storefront" class="nav-item">Home Decor</a>
          <a href="#bazaar-storefront" class="nav-item">Festive Attire</a>
          <a href="#heritage-section" class="nav-item">Artisan Heritage</a>
          <span class="festival-pill">✨ Festive Collection Live</span>
        </nav>

        <div class="nav-right">
          <!-- Currency Selector -->
          <div class="currency-picker">
            <select id="currency-select" class="currency-dropdown" aria-label="Currency Selector">
              <option value="INR" selected>₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>

          <!-- Audio Experience Toggle -->
          <button class="sound-toggle-btn ${this.soundManager.isMuted ? 'muted' : 'active'}" id="sound-toggle-btn" title="Toggle Festive Sound & Foley">
            <div class="sound-wave-bars">
              <span class="bar bar-1"></span>
              <span class="bar bar-2"></span>
              <span class="bar bar-3"></span>
            </div>
            <span class="sound-text" id="sound-label">${this.soundManager.isMuted ? 'Sound Off' : 'Sound On'}</span>
          </button>

          <!-- Cart / Festive Thali Button -->
          <button class="cart-trigger-btn" id="cart-trigger-btn" aria-label="Shopping Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="cart-label">Thali</span>
            <span class="cart-badge" id="nav-cart-badge">0</span>
          </button>
        </div>
      </header>
    `;
  }

  bindEvents() {
    const soundBtn = this.container.querySelector('#sound-toggle-btn');
    const soundLabel = this.container.querySelector('#sound-label');

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isPlaying = this.soundManager.toggleMute();
        if (isPlaying) {
          soundBtn.classList.remove('muted');
          soundBtn.classList.add('active');
          soundLabel.textContent = 'Sound On';
        } else {
          soundBtn.classList.add('muted');
          soundBtn.classList.remove('active');
          soundLabel.textContent = 'Sound Off';
        }
      });
    }

    const cartBtn = this.container.querySelector('#cart-trigger-btn');
    if (cartBtn && this.onCartClick) {
      cartBtn.addEventListener('click', () => {
        this.onCartClick();
      });
    }

    // Copy Coupon Code Click
    const copyBtn = this.container.querySelector('#bar-copy-coupon-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const code = this.container.querySelector('#announcement-coupon-code').textContent;
        navigator.clipboard.writeText(code).then(() => {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = `<span>✓ Copied:</span> <strong>${code}</strong>`;
          setTimeout(() => {
            copyBtn.innerHTML = original;
          }, 1500);
        }).catch(() => {});
      });
    }

    const currSelect = this.container.querySelector('#currency-select');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        this.currentCurrency = e.target.value;
        window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: this.currentCurrency } }));
      });
    }

    // Listen to discount-bar-updated
    window.addEventListener('discount-bar-updated', (e) => {
      this.discountSettings = e.detail;
      const bar = this.container.querySelector('#festive-discount-bar');
      const text = this.container.querySelector('#announcement-bar-text');
      const code = this.container.querySelector('#announcement-coupon-code');

      if (bar) bar.style.display = this.discountSettings.enabled ? 'flex' : 'none';
      if (text) text.textContent = this.discountSettings.text;
      if (code) code.textContent = this.discountSettings.couponCode;
    });

    // Scroll opacity adjustment
    window.addEventListener('scroll', () => {
      const nav = this.container.querySelector('#main-nav');
      if (nav) {
        if (window.scrollY > 80) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    });
  }

  updateCartCount(count) {
    this.cartCount = count;
    const badge = this.container.querySelector('#nav-cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.classList.add('bump');
      setTimeout(() => badge.classList.remove('bump'), 300);
    }
  }
}
