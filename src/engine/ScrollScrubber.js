// Smooth Scroll Scrubber with Eased Lerp Interpolation & Cinematic Scene Timing
// For Utsav Bazaar (उत्सव बाज़ार)

export class ScrollScrubber {
  constructor(options = {}) {
    this.container = options.container || document.querySelector('#scroll-track');
    this.targetProgress = 0;
    this.currentProgress = 0;
    this.lerpFactor = options.lerpFactor || 0.075;
    this.onUpdate = options.onUpdate || (() => {});
    this.onSceneChange = options.onSceneChange || (() => {});
    this.currentSceneIndex = 0;
    this.isListening = false;
    this.rafId = null;

    // Strict 5-Scene Narrative Timeline (Balanced 20% intervals for smooth unhurried scrub):
    // Scene 1: 0.00 - 0.20 (The Festive Street Run)
    // Scene 2: 0.20 - 0.40 (Courtyard Circle & Box Opening)
    // Scene 3: 0.40 - 0.60 (Lighting the Fuse - Macro Match Strike)
    // Scene 4: 0.60 - 0.80 (The Rocket Launches Skyward - Children Covering Ears)
    // Scene 5: 0.80 - 1.00 (Grand Skyburst Detonation & Home Decor Bazaar Entrance)
    this.scenes = [
      { id: 1, name: "The Festive Street Run", start: 0.00, end: 0.20 },
      { id: 2, name: "Courtyard Gathering & Box Opening", start: 0.20, end: 0.40 },
      { id: 3, name: "Lighting the Fuse & Macro Strike", start: 0.40, end: 0.60 },
      { id: 4, name: "Skyward Launch & Rocket Ascent", start: 0.60, end: 0.80 },
      { id: 5, name: "Grand Diwali Skyburst & Royal Reveal", start: 0.80, end: 1.00 }
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.calculateProgress();
    this.startLoop();
  }

  bindEvents() {
    this.handleScroll = () => {
      this.calculateProgress();
    };

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', this.handleScroll, { passive: true });
    this.isListening = true;
  }

  calculateProgress() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const totalScrollable = this.container.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) {
      this.targetProgress = 0;
      return;
    }

    // Normalized progress (0.0 to 1.0) along the scroll track
    const scrolled = -rect.top;
    const rawProgress = scrolled / totalScrollable;
    this.targetProgress = Math.max(0, Math.min(1, rawProgress));
  }

  getSceneForProgress(progress) {
    if (progress < 0.20) return 0;
    if (progress < 0.40) return 1;
    if (progress < 0.60) return 2;
    if (progress < 0.80) return 3;
    return 4;
  }

  getSceneLocalProgress(progress, sceneIndex) {
    const sc = this.scenes[sceneIndex];
    const duration = sc.end - sc.start;
    return Math.max(0, Math.min(1, (progress - sc.start) / duration));
  }

  startLoop() {
    const update = () => {
      // Smooth continuous lerp interpolation for silky 60-120fps motion
      const diff = this.targetProgress - this.currentProgress;
      this.currentProgress += diff * this.lerpFactor;

      if (Math.abs(diff) < 0.0001) {
        this.currentProgress = this.targetProgress;
      }

      // Check scene index transition
      const sceneIndex = this.getSceneForProgress(this.currentProgress);
      if (sceneIndex !== this.currentSceneIndex) {
        this.currentSceneIndex = sceneIndex;
        this.onSceneChange(sceneIndex, this.scenes[sceneIndex]);
      }

      const localProgress = this.getSceneLocalProgress(this.currentProgress, sceneIndex);

      this.onUpdate({
        globalProgress: this.currentProgress,
        targetProgress: this.targetProgress,
        sceneIndex,
        localProgress,
        sceneInfo: this.scenes[sceneIndex]
      });

      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  // Smooth scroll helper for clicking timeline pills
  scrollToScene(sceneIndex) {
    if (!this.container) return;
    const sc = this.scenes[sceneIndex];
    if (!sc) return;
    const totalScrollable = this.container.offsetHeight - window.innerHeight;
    const targetY = this.container.offsetTop + sc.start * totalScrollable;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth'
    });
  }

  destroy() {
    if (this.isListening) {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleScroll);
    }
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
