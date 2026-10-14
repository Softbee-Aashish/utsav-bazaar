// Main Entry Point for Utsav Bazaar 3D Festive Marketplace
import { soundManager } from './engine/SoundManager.js';
import { FrameLoader } from './engine/FrameLoader.js';
import { SceneRenderer } from './engine/SceneRenderer.js';
import { ScrollScrubber } from './engine/ScrollScrubber.js';
import { StoryOverlay } from './components/StoryOverlay.js';
import { Navbar } from './components/Navbar.js';
import { ShopSection } from './components/ShopSection.js';
import { CartDrawer } from './components/CartDrawer.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { AdminPanel } from './components/AdminPanel.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('✨ Initializing Utsav Bazaar (उत्सव बाज़ार)...');

  const canvas = document.querySelector('#scene-canvas');
  const scrollTrack = document.querySelector('#scroll-track');
  const hudContainer = document.querySelector('#hud-overlay');
  const navContainer = document.querySelector('#nav-container');
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

  // 3. Initialize Cart, Quick View & Admin components
  let cartDrawer = null;
  let navbar = null;

  const adminPanel = new AdminPanel(adminContainer);

  cartDrawer = new CartDrawer(cartContainer, (newCount) => {
    if (navbar) navbar.updateCartCount(newCount);
  });

  const quickViewModal = new QuickViewModal(qvContainer, (product) => {
    cartDrawer.addItem(product);
  });

  // 4. Initialize Navbar with Cart and Admin Triggers
  navbar = new Navbar(
    navContainer,
    soundManager,
    () => cartDrawer.open(),
    () => adminPanel.open()
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

  // 5. Initialize Shop Section
  new ShopSection(
    shopContainer,
    (product) => {
      cartDrawer.addItem(product);
      // Optional subtle audio chime on add
      soundManager.playCelebrationChime();
    },
    (product) => {
      quickViewModal.open(product);
    }
  );

  // 6. Initialize Scroll Scrubber with Lerp Easing
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

  // 7. Initialize Story Typographic Overlay & HUD
  const storyOverlay = new StoryOverlay(hudContainer, scrubber, frameLoader);

  // First render pass
  sceneRenderer.render();

  // 8. Auto-unlock Web Audio on first user interaction & start sweet melody
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
