// Cinematic Editorial Typographic Overlay & Scene HUD for Utsav Bazaar

export class StoryOverlay {
  constructor(container, scrubber, frameLoader) {
    this.container = container;
    this.scrubber = scrubber;
    this.frameLoader = frameLoader;
    this.currentScene = 0;

    this.sceneData = [
      {
        tag: "✦ दृश्य ०१ • SCENE 01 ✦",
        title: "Galiyon Ki Roshni",
        titleHi: "गलियों की रोशनी",
        subtitle: "The Festive Street Chase",
        caption: "Four joyful boys in vibrant silk kurtas race through illuminated Diwali streets, carrying home the auspicious festive decor hamper to adorn their courtyard.",
        description: "Four joyful boys in vibrant silk kurtas race through illuminated Diwali streets, carrying home the auspicious festive decor hamper to adorn their courtyard.",
        accent: "#E5A93C"
      },
      {
        tag: "✦ दृश्य ०२ • SCENE 02 ✦",
        title: "Parampara Ka Uphaar",
        titleHi: "परंपरा का उपहार",
        subtitle: "The Courtyard Gathering & Sacred Diya Unveiling",
        caption: "In the warm glow of courtyard diyas, eager hands unveil the hand-cast royal brass deepam and festive floral heirlooms.",
        description: "In the warm glow of courtyard diyas, eager hands unveil the hand-cast royal brass deepam and festive floral heirlooms.",
        accent: "#E01E5A"
      },
      {
        tag: "✦ दृश्य ०३ • SCENE 03 ✦",
        title: "Ek Pavitra Chingari",
        titleHi: "एक पवित्र चिंगारी",
        subtitle: "Lighting the Sacred Flame & Cotton Wick",
        caption: "A gentle match strike ignites the sacred cotton wick, casting a warm golden radiance across the family courtyard.",
        description: "A gentle match strike ignites the sacred cotton wick, casting a warm golden radiance across the family courtyard.",
        accent: "#FB8500"
      },
      {
        tag: "✦ दृश्य ०४ • SCENE 04 ✦",
        title: "Aakash Ki Ore",
        titleHi: "आकाश की ओर",
        subtitle: "City of Lights & Rooftop Illuminations",
        caption: "Across balconies and verandas, thousands of handcrafted brass lamps and glowing hanging lanterns illuminate the midnight sky.",
        description: "Across balconies and verandas, thousands of handcrafted brass lamps and glowing hanging lanterns illuminate the midnight sky.",
        accent: "#FFD700"
      },
      {
        tag: "✦ दृश्य ०५ • SCENE 05 ✦",
        title: "Divya Prakash",
        titleHi: "दिव्य प्रकाश",
        subtitle: "The Grand Diwali Skyburst Reveal",
        caption: "Concentric rings of celestial gold and sapphire light erupt into the heavens, welcoming you to Utsav Bazaar.",
        description: "Concentric rings of celestial gold and sapphire light erupt into the heavens, welcoming you to Utsav Bazaar.",
        accent: "#00F5D4"
      }
    ];

    this.render();
    this.bindEvents();
    this.update({ globalProgress: 0, sceneIndex: 0, localProgress: 0 });
  }

  render() {
    this.container.innerHTML = `
      <!-- Hidden file input for custom frame sequence if needed -->
      <input type="file" id="frames-file-input" multiple accept="image/*" style="display:none;" />

      <!-- Right Scene Navigation Timeline -->
      <nav class="scene-nav" aria-label="Scene Navigator">
        ${this.sceneData.map((s, idx) => `
          <button class="scene-pill ${idx === 0 ? 'active' : ''}" data-scene="${idx}">
            <span class="pill-number">0${idx + 1}</span>
            <span class="pill-label">${s.subtitle.split(' ')[1] || s.subtitle}</span>
          </button>
        `).join('')}
        <button class="scene-pill shop-jump-pill" id="jump-to-shop-pill">
          <span class="pill-number">🛍️</span>
          <span class="pill-label">Shop</span>
        </button>
      </nav>

      <!-- Center Stage: Grand Hero Title in Dead Center of the Skyburst -->
      <div class="story-center-stage">
        <!-- Scene 5 Finale Hero Title -->
        <div class="hero-finale-reveal" id="hero-finale-reveal">
          <div class="shubh-diwali-tag">॥ शुभ दीपावली • महा उत्सव ॥ AUSPICIOUS CELEBRATION</div>
          <h1 class="grand-hero-title">
            <span class="devanagari-hero">उत्सव बाज़ार</span>
            <span class="latin-hero">UTSAV BAZAAR</span>
          </h1>
          <p class="grand-hero-desc">
            Where Sacred Festivities Meet Timeless Luxury. Handcrafted Home Decor, Royal Silk Attire, Solid Brass Diyas, Artisanal Urlis & Sacred Heirlooms.
          </p>
          <div class="hero-cta-group">
            <button class="cta-gold-btn" id="explore-market-btn">
              <span>EXPLORE FESTIVE COLLECTION</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Story Narrative Overlay Cards (Scenes 1 to 5) -->
      <div class="story-cards-container" id="story-cards-container">
        ${this.sceneData.map((s, idx) => `
          <div class="story-card" id="story-card-${idx}">
            <div class="story-tag" style="color: ${s.accent}; text-shadow: 0 0 10px ${s.accent}40;">
              ${s.tag}
            </div>
            <h2 class="story-title">
              <span class="story-title-hi">${s.titleHi}</span>
              <span class="story-title-divider">•</span>
              <span class="story-title-en">${s.title}</span>
            </h2>
            <div class="story-subtitle">${s.subtitle}</div>
            <p class="story-caption">${s.caption}</p>
          </div>
        `).join('')}
      </div>

      <!-- Bottom Scroll Indicator & Progress Bar -->
      <div class="hud-bottom-bar">
        <div class="scroll-prompt" id="scroll-prompt">
          <span class="mouse-icon">
            <span class="mouse-wheel"></span>
          </span>
          <span class="prompt-text">SCROLL TO EXPERIENCE THE JOURNEY</span>
        </div>
        <div class="progress-track-wrapper">
          <div class="progress-track-fill" id="hud-progress-fill"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Jump between scenes via pills
    this.container.querySelectorAll('.scene-pill[data-scene]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-scene'), 10);
        this.scrubber.scrollToScene(idx);
      });
    });

    const shopJump = this.container.querySelector('#jump-to-shop-pill');
    if (shopJump) {
      shopJump.addEventListener('click', () => {
        const shop = document.querySelector('#bazaar-storefront');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      });
    }

    const exploreBtn = this.container.querySelector('#explore-market-btn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        const shop = document.querySelector('#bazaar-storefront');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // AI Frame Upload support
    const uploadBtn = this.container.querySelector('#upload-frames-btn');
    const fileInput = this.container.querySelector('#frames-file-input');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          const modeLabel = this.container.querySelector('#engine-mode-label');
          if (modeLabel) modeLabel.textContent = `Loading ${e.target.files.length} frames...`;

          this.frameLoader.loadFromFiles(e.target.files);
        }
      });
    }

    // Listen to FrameLoader events
    this.frameLoader.onProgress = (pct) => {
      const modeLabel = this.container.querySelector('#engine-mode-label');
      if (modeLabel) modeLabel.textContent = `AI Frames: ${Math.round(pct * 100)}%`;
    };

    this.frameLoader.onLoaded = (frames) => {
      const modeLabel = this.container.querySelector('#engine-mode-label');
      const pill = this.container.querySelector('#engine-mode-pill');
      if (modeLabel) modeLabel.textContent = `AI Video Sequence (${frames.length} frames)`;
      if (pill) pill.classList.add('ai-active');
    };
  }

  update(progressData) {
    const { globalProgress, sceneIndex, localProgress } = progressData;

    // Update bottom progress bar
    const fill = this.container.querySelector('#hud-progress-fill');
    if (fill) {
      fill.style.width = `${Math.min(100, globalProgress * 100)}%`;
    }

    // Update active scene pill
    const pills = this.container.querySelectorAll('.scene-pill[data-scene]');
    pills.forEach((p, idx) => {
      if (idx === sceneIndex) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    // Story Cards visibility logic for Scenes 1 to 5
    for (let idx = 0; idx < 5; idx++) {
      const card = this.container.querySelector(`#story-card-${idx}`);
      if (!card) continue;

      if (idx === sceneIndex) {
        if (idx === 4) {
          // Scene 5: show story card initially until finale reveal blooms at localProgress >= 0.20
          if (localProgress < 0.20) {
            const a = Math.max(0, 1 - (localProgress / 0.20));
            card.style.opacity = a;
            card.style.transform = `translateX(-50%) translateY(${(1 - a) * 8}px)`;
            card.style.visibility = a > 0.01 ? 'visible' : 'hidden';
          } else {
            card.style.opacity = '0';
            card.style.visibility = 'hidden';
          }
        } else if (idx === 0) {
          // Scene 1: fully visible immediately on page load, gently fades out when nearing Scene 2
          let alpha = 1;
          if (localProgress > 0.85) {
            alpha = (1 - localProgress) / 0.15;
          }
          alpha = Math.max(0, Math.min(1, alpha));
          card.style.opacity = alpha;
          card.style.transform = `translateX(-50%) translateY(${(1 - alpha) * 8}px)`;
          card.style.visibility = alpha > 0.01 ? 'visible' : 'hidden';
        } else {
          // Scenes 2, 3, 4:
          // Smooth fade in on entry (0.0 to 0.15), solid hold (0.15 to 0.85), smooth fade out on exit (0.85 to 1.0)
          let alpha = 1;
          if (localProgress < 0.15) {
            alpha = localProgress / 0.15;
          } else if (localProgress > 0.85) {
            alpha = (1 - localProgress) / 0.15;
          }
          alpha = Math.max(0, Math.min(1, alpha));
          card.style.opacity = alpha;
          card.style.transform = `translateX(-50%) translateY(${(1 - alpha) * 8}px)`;
          card.style.visibility = alpha > 0.01 ? 'visible' : 'hidden';
        }
      } else {
        card.style.opacity = '0';
        card.style.visibility = 'hidden';
      }
    }

    // Finale Reveal in Scene 5 (blooms in dead center as celestial explosion expands)
    const finale = this.container.querySelector('#hero-finale-reveal');
    const scrollPrompt = this.container.querySelector('#scroll-prompt');

    if (sceneIndex === 4 && localProgress >= 0.20) {
      if (finale) {
        finale.classList.add('visible');
        const finP = Math.min(1, (localProgress - 0.20) / 0.40);
        finale.style.opacity = finP;
        finale.style.transform = `scale(${0.92 + finP * 0.08})`;
      }
      if (scrollPrompt) scrollPrompt.style.opacity = '0';
    } else {
      if (finale) {
        finale.classList.remove('visible');
        finale.style.opacity = 0;
      }
      if (scrollPrompt) scrollPrompt.style.opacity = '1';
    }
  }
}
