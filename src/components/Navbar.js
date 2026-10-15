// High-End Luxury Navbar with Mobile Drawer, Theme Toggle, & Product Page Navigation
import { productStore } from '../engine/ProductStore.js';

export class Navbar {
  constructor(container, soundManager, onCartClick, onAdminClick, onProductsClick, onHomeClick) {
    this.container = container;
    this.soundManager = soundManager;
    this.onCartClick = onCartClick;
    this.onAdminClick = onAdminClick;
    this.onProductsClick = onProductsClick;
    this.onHomeClick = onHomeClick;
    this.cartCount = 0;
    this.currentCurrency = 'INR';
    this.currentTheme = localStorage.getItem('utsav_theme') || 'dark';
    this.discountSettings = productStore.discountSettings;
    this.isMobileMenuOpen = false;

    this.currencies = [
      { code: 'INR', symbol: '₹', rate: 1 },
      { code: 'USD', symbol: '$', rate: 0.012 },
      { code: 'EUR', symbol: '€', rate: 0.011 },
      { code: 'GBP', symbol: '£', rate: 0.0095 }
    ];

    this.applyTheme(this.currentTheme);
    this.render();
    this.bindEvents();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('utsav_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    const mobileThemeBtn = this.container.querySelector('#mobile-theme-toggle-btn');
    const iconStr = newTheme === 'light' ? '🌙 Dark' : '☀️ Light (Golden)';
    if (themeBtn) themeBtn.innerHTML = `<span>${newTheme === 'light' ? '🌙' : '☀️'}</span><span class="theme-text">${newTheme === 'light' ? 'Dark' : 'Golden Light'}</span>`;
    if (mobileThemeBtn) mobileThemeBtn.innerHTML = `<span>${newTheme === 'light' ? '🌙' : '☀️'}</span> <span>${iconStr}</span>`;
  }

  render() {
    const isLight = this.currentTheme === 'light';

    this.container.innerHTML = `
      <!-- Top Glowing Festive Announcement & Discount Bar with Dismiss Button -->
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
        <button class="bar-dismiss-btn" id="bar-dismiss-btn" aria-label="Dismiss discount bar" title="Close announcement">
          ✕
        </button>
      </div>

      <header class="luxury-navbar" id="main-nav">
        <!-- Left: Brand Logo & Mobile Hamburger -->
        <div class="nav-left">
          <button class="mobile-hamburger-btn" id="mobile-hamburger-btn" aria-label="Toggle Navigation Menu">
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
            <span class="hamburger-bar"></span>
          </button>

          <a href="#" class="brand-link" id="nav-brand-home">
            <span class="brand-diya-glow">🪔</span>
            <div class="brand-titles">
              <span class="brand-primary">UTSAV BAZAAR</span>
              <span class="brand-secondary">उत्सव बाज़ार • 2026</span>
            </div>
          </a>
        </div>

        <!-- Center: Clean Desktop Links (Home Storefront & All Products) -->
        <nav class="nav-center">
          <a href="#" class="nav-item nav-home-trigger" id="nav-item-home">Home Storefront</a>
          <!-- DEDICATED SEPARATE PRODUCT PAGE LINK IN MENU BAR -->
          <a href="#" class="nav-item nav-products-trigger highlighted-menu-item" id="nav-item-products">
            <span class="nav-shop-icon">🛍️</span>
            <span>All Products</span>
            <span class="new-pill">Explore Store</span>
          </a>
          <a href="#heritage-section" class="nav-item" id="nav-item-heritage">Artisan Heritage</a>
        </nav>

        <!-- Right: Theme Toggle, Currency, Audio & Cart -->
        <div class="nav-right">
          <!-- Dark / Light (Golden Luxury) Mode Switch -->
          <button class="theme-toggle-btn" id="theme-toggle-btn" title="Toggle Golden Light & Dark Mode" aria-label="Toggle theme">
            <span>${isLight ? '🌙' : '☀️'}</span>
            <span class="theme-text">${isLight ? 'Dark' : 'Golden Light'}</span>
          </button>

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

      <!-- Mobile Full-Screen Slide-Out Menu Drawer -->
      <div class="mobile-nav-backdrop" id="mobile-nav-backdrop"></div>
      <aside class="mobile-nav-drawer" id="mobile-nav-drawer">
        <div class="mobile-drawer-header">
          <div class="brand-link">
            <span class="brand-diya-glow">🪔</span>
            <div class="brand-titles">
              <span class="brand-primary">UTSAV BAZAAR</span>
              <span class="brand-secondary">उत्सव बाज़ार</span>
            </div>
          </div>
          <button class="mobile-drawer-close" id="mobile-drawer-close-btn" aria-label="Close menu">✕</button>
        </div>

        <div class="mobile-drawer-links">
          <a href="#" class="mobile-link" id="mobile-link-home">
            <span>🏠</span> <span>Home Storefront</span>
          </a>
          <!-- Prominent Dedicated All Products Page -->
          <a href="#" class="mobile-link mobile-link-highlight" id="mobile-link-products">
            <span>🛍️</span> <span>All Products (Store Catalog)</span>
            <span class="mobile-pill">Shop All</span>
          </a>
          <a href="#heritage-section" class="mobile-link" id="mobile-link-heritage">
            <span>👑</span> <span>Artisan Heritage Lineage</span>
          </a>
        </div>

        <div class="mobile-drawer-footer">
          <button class="mobile-theme-btn" id="mobile-theme-toggle-btn">
            <span>${isLight ? '🌙' : '☀️'}</span>
            <span>${isLight ? 'Switch to Dark Mode' : 'Switch to Golden Light Mode'}</span>
          </button>
          
          <button class="mobile-admin-btn" id="mobile-admin-btn">
            <span>⚙️</span> <span>Merchant Admin Suite</span>
          </button>
        </div>
      </aside>
    `;
  }

  bindEvents() {
    // Theme toggle (desktop)
    const themeBtn = this.container.querySelector('#theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Theme toggle (mobile)
    const mobileThemeBtn = this.container.querySelector('#mobile-theme-toggle-btn');
    if (mobileThemeBtn) {
      mobileThemeBtn.addEventListener('click', () => {
        this.toggleTheme();
        this.closeMobileMenu();
      });
    }

    // Mobile menu open / close
    const hamburgerBtn = this.container.querySelector('#mobile-hamburger-btn');
    const closeDrawerBtn = this.container.querySelector('#mobile-drawer-close-btn');
    const backdrop = this.container.querySelector('#mobile-nav-backdrop');

    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => this.openMobileMenu());
    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => this.closeMobileMenu());
    if (backdrop) backdrop.addEventListener('click', () => this.closeMobileMenu());

    // Navigation triggers: Dedicated All Products Page
    const desktopProdTrigger = this.container.querySelector('#nav-item-products');
    if (desktopProdTrigger) {
      desktopProdTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onProductsClick) this.onProductsClick('all');
      });
    }

    const mobileProdTrigger = this.container.querySelector('#mobile-link-products');
    if (mobileProdTrigger) {
      mobileProdTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeMobileMenu();
        if (this.onProductsClick) this.onProductsClick('all');
      });
    }

    // Navigation triggers: Home Journey
    const brandHome = this.container.querySelector('#nav-brand-home');
    const desktopHome = this.container.querySelector('#nav-item-home');
    const mobileHome = this.container.querySelector('#mobile-link-home');

    const handleHome = (e) => {
      e.preventDefault();
      this.closeMobileMenu();
      if (this.onHomeClick) this.onHomeClick();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (brandHome) brandHome.addEventListener('click', handleHome);
    if (desktopHome) desktopHome.addEventListener('click', handleHome);
    if (mobileHome) mobileHome.addEventListener('click', handleHome);

    const desktopHeritage = this.container.querySelector('#nav-item-heritage');
    if (desktopHeritage) {
      desktopHeritage.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onHomeClick) this.onHomeClick();
        setTimeout(() => {
          const sec = document.querySelector('#heritage-section');
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    }

    // Category click triggers
    this.container.querySelectorAll('.nav-category-trigger').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-cat');
        if (this.onProductsClick) {
          this.onProductsClick(cat);
        }
      });
    });

    this.container.querySelectorAll('[data-mobile-cat]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-mobile-cat');
        this.closeMobileMenu();
        if (this.onProductsClick) {
          this.onProductsClick(cat);
        }
      });
    });

    // Mobile Admin Button
    const mobileAdmin = this.container.querySelector('#mobile-admin-btn');
    if (mobileAdmin && this.onAdminClick) {
      mobileAdmin.addEventListener('click', () => {
        this.closeMobileMenu();
        this.onAdminClick();
      });
    }

    // Heritage links
    const mobHeritage = this.container.querySelector('#mobile-link-heritage');
    if (mobHeritage) {
      mobHeritage.addEventListener('click', () => {
        this.closeMobileMenu();
        if (this.onHomeClick) this.onHomeClick();
        setTimeout(() => {
          const sec = document.querySelector('#heritage-section');
          if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    }

    // Sound button
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

    // Cart trigger
    const cartBtn = this.container.querySelector('#cart-trigger-btn');
    if (cartBtn && this.onCartClick) {
      cartBtn.addEventListener('click', () => this.onCartClick());
    }

    // Copy coupon code
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

    // Dismiss announcement bar
    const dismissBtn = this.container.querySelector('#bar-dismiss-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const bar = this.container.querySelector('#festive-discount-bar');
        const mainNav = this.container.querySelector('#main-nav');
        if (bar) bar.style.display = 'none';
        if (mainNav) mainNav.style.top = '0px';
        document.documentElement.classList.add('discount-bar-closed');
      });
    }

    // Currency selector
    const currSelect = this.container.querySelector('#currency-select');
    if (currSelect) {
      currSelect.addEventListener('change', (e) => {
        this.currentCurrency = e.target.value;
        window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency: this.currentCurrency } }));
      });
    }

    // Discount bar update listener
    window.addEventListener('discount-bar-updated', (e) => {
      this.discountSettings = e.detail;
      const bar = this.container.querySelector('#festive-discount-bar');
      const text = this.container.querySelector('#announcement-bar-text');
      const code = this.container.querySelector('#announcement-coupon-code');

      if (bar) bar.style.display = this.discountSettings.enabled ? 'flex' : 'none';
      if (text) text.textContent = this.discountSettings.text;
      if (code) code.textContent = this.discountSettings.couponCode;
    });

    // Scroll state
    window.addEventListener('scroll', () => {
      const nav = this.container.querySelector('#main-nav');
      if (nav) {
        if (window.scrollY > 40) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }
    });
  }

  openMobileMenu() {
    this.isMobileMenuOpen = true;
    const drawer = this.container.querySelector('#mobile-nav-drawer');
    const backdrop = this.container.querySelector('#mobile-nav-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    const drawer = this.container.querySelector('#mobile-nav-drawer');
    const backdrop = this.container.querySelector('#mobile-nav-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('visible');
    document.body.style.overflow = '';
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
