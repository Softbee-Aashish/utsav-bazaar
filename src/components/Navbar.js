// High-Performance Modern Navigation Bar ("e-com mart")
import { productStore } from '../engine/ProductStore.js';

export class Navbar {
  constructor(container, soundManager, onCartClick, onAdminClick, onProductsClick, onHomeClick) {
    this.container = container;
    this.soundManager = soundManager || null;
    this.onCartClick = onCartClick;
    this.onAdminClick = onAdminClick;
    this.onProductsClick = onProductsClick;
    this.onHomeClick = onHomeClick;
    this.cartCount = 0;
    this.currentCurrency = 'INR';
    this.currentTheme = localStorage.getItem('ecom_theme') || 'dark';
    this.discountSettings = productStore.discountSettings;
    this.isMobileMenuOpen = false;

    this.currencies = [
      { code: 'INR', symbol: '₹', rate: 1 },
      { code: 'USD', symbol: '$', rate: 0.012 }
    ];

    this.applyTheme(this.currentTheme);
    this.render();
    this.bindEvents();
    this.listenToStoreUpdates();
  }

  listenToStoreUpdates() {
    window.addEventListener('discount-bar-updated', (e) => {
      this.discountSettings = e.detail;
      const bar = this.container.querySelector('#modern-discount-bar');
      const text = this.container.querySelector('#announcement-bar-text');
      const code = this.container.querySelector('#announcement-coupon-code');
      if (bar) bar.style.display = this.discountSettings.enabled ? 'flex' : 'none';
      if (text) text.innerText = this.discountSettings.text;
      if (code) code.innerText = this.discountSettings.couponCode;
    });
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('ecom_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = `
        <span>${newTheme === 'light' ? '🌙' : '☀️'}</span>
        <span class="theme-text">${newTheme === 'light' ? 'Dark' : 'Light'}</span>
      `;
    }
  }

  render() {
    const isLight = this.currentTheme === 'light';

    this.container.innerHTML = `
      <!-- Top Promotional Bar -->
      <div class="modern-announcement-bar" id="modern-discount-bar" style="${this.discountSettings.enabled ? 'display:flex;' : 'display:none;'}">
        <div class="marquee-content">
          <span class="bar-sparkle">✦</span>
          <span class="bar-text" id="announcement-bar-text">${this.discountSettings.text}</span>
          <button class="bar-coupon-pill" id="bar-copy-coupon-btn" title="Click to copy coupon code">
            <span>USE CODE:</span> <strong id="announcement-coupon-code">${this.discountSettings.couponCode}</strong>
          </button>
          <span class="bar-sparkle">✦</span>
        </div>
        <button class="bar-dismiss-btn" id="bar-dismiss-btn" aria-label="Dismiss banner" title="Close banner">✕</button>
      </div>

      <header class="modern-navbar" id="main-nav">
        <!-- Left: Brand Logo & Mobile Hamburger -->
        <div class="nav-left">
          <button class="mobile-hamburger-btn" id="mobile-hamburger-btn" aria-label="Toggle Navigation Menu">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>

          <a href="#" class="brand-link" id="nav-brand-home">
            <div class="brand-logo-mark">
              <span class="brand-leaf-dot"></span>
              <span class="brand-text-main">e-com <strong style="color: #10B981;">mart</strong></span>
            </div>
          </a>
        </div>

        <!-- Center: Modern Navigation Links -->
        <nav class="nav-center">
          <a href="#" class="nav-item nav-home-trigger" id="nav-item-home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span>Home</span>
          </a>
          <a href="#" class="nav-item nav-products-trigger" id="nav-item-products">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>All Products</span>
          </a>
          <a href="#/admin" class="nav-item nav-admin-trigger" id="nav-item-admin-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            <span>Merchant Console</span>
          </a>
        </nav>

        <!-- Right: Actions (Theme Toggle, Currency, Admin & Cart) -->
        <div class="nav-right">
          <!-- Theme Toggle -->
          <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Light / Dark Mode">
            <span>${isLight ? '🌙' : '☀️'}</span>
            <span class="theme-text">${isLight ? 'Dark' : 'Light'}</span>
          </button>

          <!-- Currency Selector -->
          <div class="currency-picker">
            <select id="currency-select" class="currency-dropdown" aria-label="Currency Selector">
              <option value="INR" selected>₹ INR</option>
              <option value="USD">$ USD</option>
            </select>
          </div>

          <!-- Admin Quick Button -->
          <button class="nav-admin-quick-btn" id="nav-admin-btn" title="Open Merchant Suite (Admin Console)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="admin-quick-text">Admin</span>
          </button>

          <!-- Shopping Cart Trigger -->
          <button class="cart-trigger-btn" id="cart-trigger-btn" aria-label="Shopping Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span class="cart-label">Cart</span>
            <span class="cart-badge" id="nav-cart-badge">${this.cartCount}</span>
          </button>
        </div>
      </header>

      <!-- Mobile Full-Screen Slide-Out Menu Drawer -->
      <div class="mobile-nav-backdrop" id="mobile-nav-backdrop" style="display: none;"></div>
      <div class="mobile-nav-drawer" id="mobile-nav-drawer">
        <div class="mobile-drawer-header">
          <div class="brand-logo-mark">
            <span class="brand-leaf-dot"></span>
            <span class="brand-text-main">e-com <strong style="color: #10B981;">mart</strong></span>
          </div>
          <button class="drawer-close-btn" id="drawer-close-btn" aria-label="Close Menu">✕</button>
        </div>

        <div class="mobile-drawer-body">
          <div class="drawer-nav-links">
            <button class="drawer-nav-link" id="m-nav-home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Home Storefront</span>
            </button>
            <button class="drawer-nav-link" id="m-nav-all-products">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Explore All Products</span>
            </button>
            <button class="drawer-nav-link" id="m-nav-admin">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              <span>Merchant Admin Suite</span>
            </button>
          </div>

          <!-- Dynamic Active Categories List -->
          <div class="drawer-category-section">
            <div class="drawer-section-heading">Browse Categories</div>
            <div class="drawer-category-pills" id="drawer-category-pills">
              ${productStore.getActiveCategories().map(cat => `
                <button class="drawer-cat-pill" data-category="${cat.key}">${cat.name} (${cat.count})</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  updateCartCount(count) {
    this.cartCount = count;
    const badge = this.container.querySelector('#nav-cart-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  bindEvents() {
    // Brand click -> home
    const brandHome = this.container.querySelector('#nav-brand-home');
    if (brandHome) {
      brandHome.onclick = (e) => {
        e.preventDefault();
        if (this.onHomeClick) this.onHomeClick();
      };
    }

    // Home link
    const homeBtn = this.container.querySelector('#nav-item-home');
    if (homeBtn) {
      homeBtn.onclick = (e) => {
        e.preventDefault();
        if (this.onHomeClick) this.onHomeClick();
      };
    }

    // Products link
    const prodBtn = this.container.querySelector('#nav-item-products');
    if (prodBtn) {
      prodBtn.onclick = (e) => {
        e.preventDefault();
        if (this.onProductsClick) this.onProductsClick('all');
      };
    }

    // Admin triggers
    const adminBtn = this.container.querySelector('#nav-admin-btn');
    if (adminBtn) {
      adminBtn.onclick = () => {
        if (this.onAdminClick) this.onAdminClick();
      };
    }

    const adminCenterBtn = this.container.querySelector('#nav-item-admin-center');
    if (adminCenterBtn) {
      adminCenterBtn.onclick = (e) => {
        e.preventDefault();
        if (this.onAdminClick) this.onAdminClick();
      };
    }

    // Cart trigger
    const cartBtn = this.container.querySelector('#cart-trigger-btn');
    if (cartBtn) {
      cartBtn.onclick = () => {
        if (this.onCartClick) this.onCartClick();
      };
    }

    // Theme toggle
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.onclick = () => this.toggleTheme();
    }

    // Coupon copy
    const copyBtn = this.container.querySelector('#bar-copy-coupon-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(this.discountSettings.couponCode);
        copyBtn.innerText = 'COPIED!';
        setTimeout(() => {
          copyBtn.innerHTML = `<span>USE CODE:</span> <strong>${this.discountSettings.couponCode}</strong>`;
        }, 1500);
      };
    }

    // Dismiss banner
    const dismissBtn = this.container.querySelector('#bar-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.onclick = () => {
        const bar = this.container.querySelector('#modern-discount-bar');
        if (bar) bar.style.display = 'none';
      };
    }

    // Mobile Hamburger
    const hamburger = this.container.querySelector('#mobile-hamburger-btn');
    const drawer = this.container.querySelector('#mobile-nav-drawer');
    const backdrop = this.container.querySelector('#mobile-nav-backdrop');
    const drawerClose = this.container.querySelector('#drawer-close-btn');

    const openDrawer = () => {
      if (drawer) drawer.classList.add('open');
      if (backdrop) backdrop.style.display = 'block';
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      if (drawer) drawer.classList.remove('open');
      if (backdrop) backdrop.style.display = 'none';
      document.body.style.overflow = '';
    };

    if (hamburger) hamburger.onclick = openDrawer;
    if (drawerClose) drawerClose.onclick = closeDrawer;
    if (backdrop) backdrop.onclick = closeDrawer;

    // Mobile drawer navigation
    const mHome = this.container.querySelector('#m-nav-home');
    if (mHome) {
      mHome.onclick = () => {
        closeDrawer();
        if (this.onHomeClick) this.onHomeClick();
      };
    }

    const mAll = this.container.querySelector('#m-nav-all-products');
    if (mAll) {
      mAll.onclick = () => {
        closeDrawer();
        if (this.onProductsClick) this.onProductsClick('all');
      };
    }

    const mAdmin = this.container.querySelector('#m-nav-admin');
    if (mAdmin) {
      mAdmin.onclick = () => {
        closeDrawer();
        if (this.onAdminClick) this.onAdminClick();
      };
    }

    this.container.querySelectorAll('.drawer-cat-pill').forEach(pill => {
      pill.onclick = () => {
        const cat = pill.getAttribute('data-category');
        closeDrawer();
        if (this.onProductsClick) this.onProductsClick(cat);
      };
    });
  }
}
