// Main Entry Point for Utsav Bazaar 3D Festive Marketplace
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

  // 1. Initialize Frame Loader
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

  // 3. Initialize Cart & Admin components
  let cartDrawer = null;
  let navbar = null;
  let productPage = null;

  const adminPanel = new AdminPanel(adminContainer);

  cartDrawer = new CartDrawer(cartContainer, (newCount) => {
    if (navbar) navbar.updateCartCount(newCount);
  });

  const quickViewModal = new QuickViewModal(qvContainer, (product) => {
    cartDrawer.addItem(product);
  });

  // 4. Initialize Dedicated Flipkart/Amazon Style Product Page
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

  // 5. Initialize Navbar with Mobile Menu, Theme Toggle, & Separate Product Page
  navbar = new Navbar(
    navContainer,
    soundManager,
    () => cartDrawer.open(),
    () => adminPanel.open(),
    (category = 'all') => {
      // Show Dedicated All Products Page
      if (scrollTrack) scrollTrack.style.display = 'none';
      if (shopContainer) shopContainer.style.display = 'none';
      productPage.showListing(category);
    },
    () => {
      // Return to Home Journey
      if (scrollTrack) scrollTrack.style.display = 'block';
      if (shopContainer) shopContainer.style.display = 'block';
      productPage.hide();
    }
  );

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
      productPage.showProductDetail(productId);
    }
  });

  // Direct Buy Now event listener to open guest checkout
  document.addEventListener('direct-buy-now', () => {
    cartDrawer.openGuestCheckout();
  });

  // 7. Initialize Scroll Scrubber with Lerp Easing
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

  // 8. Initialize Story Typographic Overlay & HUD
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
