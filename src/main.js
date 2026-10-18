// Main Entry Point for Utsav Bazaar Luxury Festive Marketplace
import { soundManager } from './engine/SoundManager.js';
import { FrameLoader } from './engine/FrameLoader.js';
import { SceneRenderer } from './engine/SceneRenderer.js';
import { ScrollScrubber } from './engine/ScrollScrubber.js';
import { StoryOverlay } from './components/StoryOverlay.js';
import { Navbar } from './components/Navbar.js';
import { ShopSection } from './components/ShopSection.js';
import { ProductPage } from './components/ProductPage.js';
import { CartDrawer } from './components/CartDrawer.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { AdminPanel } from './components/AdminPanel.js';
import { PolicyModal } from './components/PolicyModal.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✨ Initializing Utsav Bazaar (उत्सव बाज़ार)...');

  const canvas = document.querySelector('#scene-canvas');
  const scrollTrack = document.querySelector('#scroll-track');
  const hudContainer = document.querySelector('#hud-overlay');
  const navContainer = document.querySelector('#nav-container');
  const productPageContainer = document.querySelector('#product-page-container');
  const shopContainer = document.querySelector('#shop-container');
  const cartContainer = document.querySelector('#cart-container');
  const qvContainer = document.querySelector('#quickview-container');
  const adminContainer = document.querySelector('#admin-container');

  // 1. Initialize Frame Loader for 3D Cinematic Animation
  const frameLoader = new FrameLoader({
    totalFrames: 60,
    onProgress: (pct) => {
      console.log(`Loading frames: ${Math.round(pct * 100)}%`);
    },
    onLoaded: (frames) => {
      console.log(`Loaded ${frames.length} AI frames successfully!`);
    }
  });

  // 2. Initialize Scene Renderer
  const sceneRenderer = new SceneRenderer(canvas, frameLoader);

  // 1. Initialize Cart & Admin components
  let cartDrawer = null;
  let navbar = null;
  let productPage = null;

  const adminPanel = new AdminPanel(adminContainer, () => {
    // Return to Storefront Home with Animation
    if (scrollTrack) scrollTrack.style.display = 'block';
    if (shopContainer) shopContainer.style.display = 'block';
    if (productPage) productPage.hide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  cartDrawer = new CartDrawer(cartContainer, (newCount) => {
    if (navbar) navbar.updateCartCount(newCount);
  });

  const quickViewModal = new QuickViewModal(qvContainer, (product) => {
    cartDrawer.addItem(product);
  });

  // 2. Initialize Dedicated Flipkart/Amazon Style Product Page
  productPage = new ProductPage(
    productPageContainer,
    (product) => {
      cartDrawer.addItem(product);
      soundManager.playCelebrationChime();
    },
    (product, qty = 1) => {
      for (let i = 0; i < qty; i++) {
        cartDrawer.addItem(product);
      }
      soundManager.playCelebrationChime();
      cartDrawer.openGuestCheckout();
    }
  );

  // Central URL Hash Router & Page Redirector
  const navigateToRoute = (hash) => {
    const rawHash = hash || window.location.hash || '#/';
    const cleanHash = rawHash.replace(/^#\/?/, '').trim();

    // 1. Admin Routes: #/admin or #/admin/orders, #/admin/products, etc.
    if (cleanHash.startsWith('admin')) {
      const parts = cleanHash.split('/');
      const tab = parts[1] || 'overview';
      adminPanel.open(tab, false);
      return;
    }

    // 2. Product Detail Route: #/product/ub-001
    if (cleanHash.startsWith('product/')) {
      const productId = cleanHash.split('/')[1];
      if (productId) {
        if (adminPanel.isOpen) adminPanel.close(false);
        if (scrollTrack) scrollTrack.style.display = 'none';
        if (shopContainer) shopContainer.style.display = 'none';
        productPage.showProductDetail(productId, false);
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
    }

    // 3. Products Catalog Route: #/products or #/products/diyas
    if (cleanHash.startsWith('products')) {
      const parts = cleanHash.split('/');
      const category = parts[1] || 'all';
      if (adminPanel.isOpen) adminPanel.close(false);
      if (scrollTrack) scrollTrack.style.display = 'none';
      if (shopContainer) shopContainer.style.display = 'none';
      productPage.showListing(category, '', false);
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    // 4. Default Home Storefront: #/ or empty
    if (adminPanel.isOpen) adminPanel.close(false);
    productPage.hide(false);
    if (scrollTrack) scrollTrack.style.display = 'block';
    if (shopContainer) shopContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Listen to browser Back/Forward buttons and direct URL paste
  window.addEventListener('hashchange', () => {
    navigateToRoute(window.location.hash);
  });

  // 3. Initialize Navbar with Mobile Menu, Theme Toggle, & Separate Product Page
  navbar = new Navbar(
    navContainer,
    soundManager,
    () => cartDrawer.open(),
    () => {
      adminPanel.open('overview', true);
    },
    (category = 'all') => {
      // Show Dedicated All Products Page
      if (scrollTrack) scrollTrack.style.display = 'none';
      if (shopContainer) shopContainer.style.display = 'none';
      productPage.showListing(category, '', true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    () => {
      // Return to Storefront Home with Animation
      if (scrollTrack) scrollTrack.style.display = 'block';
      if (shopContainer) shopContainer.style.display = 'block';
      productPage.hide(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  );

  // Trigger initial route based on browser URL
  if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
    navigateToRoute(window.location.hash);
  }

  // Footer Copyright Double-Click Admin Trigger
  const footerCopyrightTrigger = document.querySelector('#footer-copyright-trigger');
  if (footerCopyrightTrigger) {
    let clickCount = 0;
    let clickTimer = null;

    footerCopyrightTrigger.addEventListener('click', (e) => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 400);
      } else if (clickCount >= 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        adminPanel.open();
      }
    });

    footerCopyrightTrigger.addEventListener('dblclick', (e) => {
      e.preventDefault();
      adminPanel.open();
    });
  }

  // Initialize Policy Modal Dialog
  const policyModal = new PolicyModal();

  // Dynamic Footer Category Links Rendering (Only active categories with available items)
  const renderFooterCategories = () => {
    const list = document.querySelector('#footer-category-list');
    if (!list) return;
    const cats = productStore.getActiveCategories();
    if (cats.length === 0) {
      list.innerHTML = `
        <li><a href="#/products" class="footer-category-link" data-cat="all">Explore Complete Catalog</a></li>
        <li style="font-size: 11px; color: #888; padding: 4px 0;">No active categories yet</li>
      `;
    } else {
      list.innerHTML = `
        <li><a href="#/products" class="footer-category-link" data-cat="all">Grand All-Store Catalog</a></li>
        ${cats.map(c => `
          <li><a href="#/products/${c.key}" class="footer-category-link" data-cat="${c.key}">${c.name} (${c.count})</a></li>
        `).join('')}
      `;
    }

    list.querySelectorAll('.footer-category-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.getAttribute('data-cat') || 'all';
        if (scrollTrack) scrollTrack.style.display = 'none';
        if (shopContainer) shopContainer.style.display = 'none';
        productPage.showListing(cat, '', true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  };

  renderFooterCategories();
  window.addEventListener('products-updated', () => {
    renderFooterCategories();
  });

  // Footer Customer Care Links Delegation
  const footerTrackBtn = document.querySelector('#footer-link-track');
  if (footerTrackBtn) {
    footerTrackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      cartDrawer.open();
    });
  }

  const footerDispatchBtn = document.querySelector('#footer-link-dispatch');
  if (footerDispatchBtn) {
    footerDispatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      policyModal.open('dispatch');
    });
  }

  const footerReturnsBtn = document.querySelector('#footer-link-returns');
  if (footerReturnsBtn) {
    footerReturnsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      policyModal.open('returns');
    });
  }

  const footerBulkBtn = document.querySelector('#footer-link-bulk');
  if (footerBulkBtn) {
    footerBulkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      policyModal.open('bulk');
    });
  }

  // Footer Sacred Promise & Legal Policy Links Delegation
  document.querySelectorAll('.footer-policy-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const policyKey = link.getAttribute('data-policy');
      if (policyKey) {
        policyModal.open(policyKey);
      }
    });
  });

  // 6. Initialize Home Shop Section
  new ShopSection(
    shopContainer,
    (product) => {
      cartDrawer.addItem(product);
      soundManager.playCelebrationChime();
    },
    (product) => {
      // When clicking quickview, also open detailed product page or modal
      quickViewModal.open(product);
    }
  );

  // Global event delegation for product card clicks on home storefront to open full detail page
  document.addEventListener('open-product-detail', (e) => {
    const { productId } = e.detail;
    if (productId) {
      if (scrollTrack) scrollTrack.style.display = 'none';
      if (shopContainer) shopContainer.style.display = 'none';
      productPage.showProductDetail(productId, true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Direct Buy Now event listener to open guest checkout
  document.addEventListener('direct-buy-now', () => {
    cartDrawer.openGuestCheckout();
  });

  // 7. Initialize Scroll Scrubber for 3D Cinematic Animation
  const scrubber = new ScrollScrubber({
    container: scrollTrack,
    lerpFactor: 0.085,
    onUpdate: (progressData) => {
      sceneRenderer.update(progressData);
      sceneRenderer.render();
      storyOverlay.update(progressData);
    },
    onSceneChange: (sceneIndex, sceneInfo) => {
      console.log(`Transitioned to Scene ${sceneIndex + 1}: ${sceneInfo.name}`);
      soundManager.handleSceneTransition(sceneIndex);
    }
  });

  // 8. Initialize Story HUD Overlay (Clean animation without story card text)
  const storyOverlay = new StoryOverlay(hudContainer, scrubber, frameLoader);

  // First render pass
  sceneRenderer.render();

  // 9. Auto-unlock Web Audio on first user interaction & start sweet melody
  const unlockAudio = () => {
    soundManager.init();
    if (soundManager.isMuted) {
      soundManager.toggleMute();
      const soundBtn = document.querySelector('#sound-toggle-btn');
      const soundLabel = document.querySelector('#sound-label');
      if (soundBtn) {
        soundBtn.classList.remove('muted');
        soundBtn.classList.add('active');
      }
      if (soundLabel) {
        soundLabel.textContent = 'Sound On';
      }
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('scroll', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
  window.addEventListener('scroll', unlockAudio);

  console.log('🎇 Utsav Bazaar is ready to celebrate!');
});
