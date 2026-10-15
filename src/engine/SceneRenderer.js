// Cinematic 3D Scene Engine with Interactive Mouse-Sensitive Fairy Lights & AI Artworks
// For Utsav Bazaar (उत्सव बाज़ार)

export class SceneRenderer {
  constructor(canvas, frameLoader) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.frameLoader = frameLoader;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Mouse pointer state for interactive fairy lights
    this.mouseX = -1000;
    this.mouseY = -1000;
    this.mouseSpeed = 0;
    this.lastMouseX = -1000;
    this.lastMouseY = -1000;

    // Internal animation state
    this.globalProgress = 0;
    this.sceneIndex = 0;
    this.localProgress = 0;
    this.time = 0;

    // Preload generated 3D scene artworks
    this.sceneImages = {
      scene1: this.loadAsset('/assets/scenes/scene1.jpg'),
      scene2: this.loadAsset('/assets/scenes/scene2.jpg'),
      scene3: this.loadAsset('/assets/scenes/scene3.png'),
      scene4: this.loadAsset('/assets/scenes/scene4.jpg'),
      scene5: this.loadAsset('/assets/scenes/scene5.jpg')
    };

    // Particle systems
    this.fairyLights = [];
    this.sparkParticles = [];
    this.smokeParticles = [];
    this.fireworkParticles = [];
    this.floatingEmbers = [];

    this.initFairyLights();
    this.initParticles();
    this.resize();
    this.bindEvents();
    this.startLoop();
  }

  loadAsset(src) {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      img._isReady = true;
      this.render();
    };
    return img;
  }

  startLoop() {
    const loop = () => {
      this.time += 0.02;
      this.updateFairyLightsPhysics();
      // Update floating embers
      this.floatingEmbers.forEach(e => {
        e.y += e.vy * 0.01;
        e.x += e.vx * 0.01;
        if (e.y < -0.05) e.y = 1.05;
        if (e.x < -0.05) e.x = 1.05;
        if (e.x > 1.05) e.x = -0.05;
      });
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse & Touch tracking for interactive fairy lights disturbance
    const onMove = (clientX, clientY) => {
      this.mouseSpeed = Math.hypot(clientX - this.lastMouseX, clientY - this.lastMouseY);
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      this.mouseX = clientX;
      this.mouseY = clientY;
    };

    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouseX = -1000;
      this.mouseY = -1000;
    });
  }

  initFairyLights() {
    // Exactly 3 elegant, non-disturbing golden festive lights
    const configs = [
      { xRatio: 0.22, yBase: 65, color: '#FFD700', radius: 6.5 },
      { xRatio: 0.50, yBase: 88, color: '#FFB703', radius: 7.5 },
      { xRatio: 0.78, yBase: 65, color: '#FFA500', radius: 6.5 }
    ];

    this.fairyLights = configs.map((cfg, i) => ({
      xRatio: cfg.xRatio,
      yBase: cfg.yBase,
      color: cfg.color,
      radius: cfg.radius,
      phase: i * 1.6,
      dispX: 0,
      dispY: 0,
      vx: 0,
      vy: 0,
      glow: 0.85
    }));
  }

  initParticles() {
    // Floating festive golden embers
    this.floatingEmbers = [];
    for (let i = 0; i < 35; i++) {
      this.floatingEmbers.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.5,
        size: 1.5 + Math.random() * 2.0,
        alpha: 0.2 + Math.random() * 0.5,
        color: Math.random() > 0.4 ? '#FFD700' : '#FF9E00'
      });
    }

    // Grand Skyburst particles (Scene 5)
    this.fireworkParticles = [];
    const burstCount = 180;
    const burstColors = ['#FFD700', '#FFB703', '#00F5D4', '#FB8500', '#FFFFFF', '#FF007F', '#E0AAFF'];
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = 3.0 + Math.random() * 9.0;
      this.fireworkParticles.push({
        angle,
        speed,
        baseColor: burstColors[i % burstColors.length],
        size: 2.0 + Math.random() * 3.5,
        flicker: Math.random() * Math.PI * 2
      });
    }
  }

  update(progressData) {
    this.globalProgress = progressData.globalProgress;
    this.sceneIndex = progressData.sceneIndex;
    this.localProgress = progressData.localProgress;
    this.time += 0.02;

    // Update floating embers
    this.floatingEmbers.forEach(e => {
      e.y += e.vy * 0.01;
      e.x += e.vx * 0.01;
      if (e.y < -0.05) e.y = 1.05;
      if (e.x < -0.05) e.x = 1.05;
      if (e.x > 1.05) e.x = -0.05;
    });

    // Update interactive fairy lights physics (gentle & subtle)
    this.updateFairyLightsPhysics();
  }

  // Gentle, calm mouse hover sensitivity for the 3 hanging lights (non-disturbing)
  updateFairyLightsPhysics() {
    const hoverRadius = 80;

    this.fairyLights.forEach(l => {
      const baseX = l.xRatio * this.width;
      const baseY = l.yBase + Math.sin(this.time * 2 + l.phase) * 2;
      const curX = baseX + l.dispX;
      const curY = baseY + l.dispY;

      const dist = Math.hypot(curX - this.mouseX, curY - this.mouseY);

      if (dist < hoverRadius && this.mouseX > 0) {
        // Gentle, subtle deflection (max ~8px)
        const norm = 1 - dist / hoverRadius;
        const pushX = ((curX - this.mouseX) / (dist + 0.001)) * norm * 8;
        const pushY = ((curY - this.mouseY) / (dist + 0.001)) * norm * 6;

        l.vx += pushX * 0.15;
        l.vy += pushY * 0.15;
        l.glow = Math.min(1.0, l.glow + 0.05);
      } else {
        l.glow = 0.85 + 0.12 * Math.sin(this.time * 2 + l.phase);
      }

      // Smooth spring damping for organic resting sway
      const springK = 0.06;
      const damping = 0.88;
      const ax = -l.dispX * springK;
      const ay = -l.dispY * springK;

      l.vx = (l.vx + ax) * damping;
      l.vy = (l.vy + ay) * damping;
      l.dispX += l.vx;
      l.dispY += l.vy;
    });
  }

  render() {
    this.ctx.save();
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Void background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Check if custom extracted frame sequence exists
    const customFrame = this.frameLoader.getFrameForProgress(this.globalProgress);
    if (customFrame && customFrame.complete && customFrame.naturalWidth > 0) {
      this.renderAIFrame(customFrame);
    } else {
      this.renderActiveScene();
    }

    this.ctx.restore();
  }

  renderActiveScene() {
    const gp = Math.max(0, Math.min(1, this.globalProgress));

    // Continuous 5-scene timeline over [0.00 to 1.00]:
    // Scene 1: 0.00 - 0.20 (The Festive Street Run)
    // Scene 2: 0.20 - 0.40 (Courtyard Gathering & Box Opening)
    // Scene 3: 0.40 - 0.60 (Lighting the Fuse & Macro Match Strike)
    // Scene 4: 0.60 - 0.80 (Skyward Launch & Rocket Ascent)
    // Scene 5: 0.80 - 1.00 (Grand Diwali Skyburst Detonation)

    if (gp < 0.20) {
      const p = gp / 0.20;
      this.renderScene1_StreetRun(p, 1.0);
      if (gp > 0.16) {
        const blend = (gp - 0.16) / 0.04;
        this.renderScene2_CourtyardHandoff(0, blend);
      }
    } else if (gp < 0.40) {
      const p = (gp - 0.20) / 0.20;
      if (gp < 0.24) {
        // Crossfade from Scene 1 (works forward AND in reverse)
        const blend = (0.24 - gp) / 0.04;
        this.renderScene1_StreetRun(1.0, blend);
        this.renderScene2_CourtyardHandoff(p, 1.0);
      } else {
        this.renderScene2_CourtyardHandoff(p, 1.0);
        if (gp > 0.36) {
          const blend = (gp - 0.36) / 0.04;
          this.renderScene3_MacroMatchStrike(0, blend);
        }
      }
    } else if (gp < 0.60) {
      const p = (gp - 0.40) / 0.20;
      if (gp < 0.44) {
        // Crossfade from Scene 2
        const blend = (0.44 - gp) / 0.04;
        this.renderScene2_CourtyardHandoff(1.0, blend);
        this.renderScene3_MacroMatchStrike(p, 1.0);
      } else {
        this.renderScene3_MacroMatchStrike(p, 1.0);
        if (gp > 0.56) {
          const blend = (gp - 0.56) / 0.04;
          this.renderScene4_SkywardAscent(0, blend);
        }
      }
    } else if (gp < 0.80) {
      const p = (gp - 0.60) / 0.20;
      if (gp < 0.64) {
        // Crossfade from Scene 3
        const blend = (0.64 - gp) / 0.04;
        this.renderScene3_MacroMatchStrike(1.0, blend);
        this.renderScene4_SkywardAscent(p, 1.0);
      } else {
        this.renderScene4_SkywardAscent(p, 1.0);
        if (gp > 0.76) {
          const blend = (gp - 0.76) / 0.04;
          this.renderScene5_GrandDiwaliBurst(0, blend);
        }
      }
    } else {
      const p = (gp - 0.80) / 0.20;
      if (gp < 0.84) {
        // Crossfade from Scene 4
        const blend = (0.84 - gp) / 0.04;
        this.renderScene4_SkywardAscent(1.0, blend);
        this.renderScene5_GrandDiwaliBurst(p, 1.0);
      } else {
        this.renderScene5_GrandDiwaliBurst(p, 1.0);
      }
    }

    // Unified gentle outer vignette
    this.drawEdgeVignette();
  }

  // Draw an artwork image with cover fit and specified alpha
  drawImageCover(img, scale = 1.0, panX = 0, panY = 0, alpha = 1.0) {
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    this.ctx.save();
    this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = this.width / this.height;

    let baseW, baseH;
    if (canvasAspect > imgAspect) {
      baseW = this.width;
      baseH = baseW / imgAspect;
    } else {
      baseH = this.height;
      baseW = baseH * imgAspect;
    }

    const w = baseW * scale;
    const h = baseH * scale;
    const x = (this.width - w) / 2 + panX;
    const y = (this.height - h) / 2 + panY;

    this.ctx.drawImage(img, x, y, w, h);
    this.ctx.restore();
    return true;
  }

  // Soft single-pass outer edge vignette (subtle framing without darkening the scenes)
  drawEdgeVignette() {
    this.ctx.save();
    const maxDim = Math.max(this.width, this.height);
    const vignette = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, maxDim * 0.45,
      this.width / 2, this.height / 2, maxDim * 0.75
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    this.ctx.fillStyle = vignette;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  // SCENE 1: The Festive Street Run (0% - 20%)
  renderScene1_StreetRun(p, alpha = 1.0) {
    const scale = 1.0 + p * 0.12;
    const panY = -p * 15;
    this.drawImageCover(this.sceneImages.scene1, scale, 0, panY, alpha);

    this.drawFloatingEmbers(alpha);
    this.renderFairyLights(alpha);
  }

  // SCENE 2: Courtyard Gathering & Box Opening (20% - 40%)
  renderScene2_CourtyardHandoff(p, alpha = 1.0) {
    const scale = 1.0 + p * 0.10;
    const panY = p * 10;
    this.drawImageCover(this.sceneImages.scene2, scale, 0, panY, alpha);

    // Pulsing golden warmth on the courtyard rangoli diyas & open box
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const cx = this.width / 2;
    const cy = this.height * 0.62;
    const diyaGlow = this.ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
    const diyaPulse = 0.22 + 0.06 * Math.sin(this.time * 4);
    diyaGlow.addColorStop(0, `rgba(255, 190, 60, ${diyaPulse})`);
    diyaGlow.addColorStop(0.5, `rgba(255, 120, 20, ${diyaPulse * 0.5})`);
    diyaGlow.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = diyaGlow;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 220, 0, Math.PI * 2);
    this.ctx.fill();

    // Overhead hanging lamp warm spotlight beam
    const lampGlow = this.ctx.createRadialGradient(cx, 0, 0, cx, 80, 280);
    lampGlow.addColorStop(0, 'rgba(255, 230, 160, 0.30)');
    lampGlow.addColorStop(0.6, 'rgba(255, 170, 40, 0.10)');
    lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = lampGlow;
    this.ctx.beginPath();
    this.ctx.moveTo(cx - 30, 0);
    this.ctx.lineTo(cx + 30, 0);
    this.ctx.lineTo(cx + 260, this.height * 0.7);
    this.ctx.lineTo(cx - 260, this.height * 0.7);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    this.drawFloatingEmbers(alpha);
  }

  // SCENE 3: Macro Match Strike & Sizzling Fuse (40% - 60%)
  renderScene3_MacroMatchStrike(p, alpha = 1.0) {
    const scale = 1.05 + p * 0.14;
    const panX = -p * 12;
    const panY = p * 8;
    this.drawImageCover(this.sceneImages.scene3, scale, panX, panY, alpha);

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const flameX = this.width * 0.53 + panX;
    const flameY = this.height * 0.42 + panY;

    // Glowing intense radial flare on the burning spark point
    const sparkPower = 0.5 + p * 0.5;
    const flare = this.ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, 80 * sparkPower);
    flare.addColorStop(0, 'rgba(255, 240, 180, 0.95)');
    flare.addColorStop(0.3, 'rgba(255, 140, 0, 0.6)');
    flare.addColorStop(0.7, 'rgba(255, 40, 0, 0.2)');
    flare.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = flare;
    this.ctx.beginPath();
    this.ctx.arc(flameX, flameY, 80 * sparkPower, 0, Math.PI * 2);
    this.ctx.fill();

    // Cascading sizzling sparks spraying outward from the fuse
    const sparkCount = Math.floor(20 + p * 35);
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.random() - 0.3) * Math.PI * 1.6;
      const dist = 10 + Math.random() * 100 * sparkPower;
      const px = flameX + Math.cos(angle) * dist;
      const py = flameY + Math.sin(angle) * dist;

      this.ctx.strokeStyle = Math.random() > 0.4 ? '#FFD700' : '#FFFFFF';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(flameX + Math.cos(angle) * (dist * 0.85), flameY + Math.sin(angle) * (dist * 0.85));
      this.ctx.lineTo(px, py);
      this.ctx.stroke();

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(px, py, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Delicate curling plumes of white volumetric smoke
    this.ctx.fillStyle = 'rgba(240, 240, 255, 0.16)';
    for (let i = 0; i < 5; i++) {
      const sx = flameX + 15 + Math.sin(this.time * 2.5 + i) * (20 + i * 12);
      const sy = flameY - 30 - i * 28;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 12 + i * 9, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // SCENE 4: Skyward Launch & Rocket Ascent (60% - 80%)
  renderScene4_SkywardAscent(p, alpha = 1.0) {
    const scale = 1.0 + p * 0.15;
    const panY = p * 45;
    this.drawImageCover(this.sceneImages.scene4, scale, 0, panY, alpha);

    this.renderFairyLights(alpha);

    // Compute rocket position matching the exact image cover coordinates
    const imgAspect = 1920 / 1080; // 16:9 scene4 aspect ratio
    const canvasAspect = this.width / this.height;
    let baseW, baseH;
    if (canvasAspect > imgAspect) {
      baseW = this.width;
      baseH = baseW / imgAspect;
    } else {
      baseH = this.height;
      baseW = baseH * imgAspect;
    }
    const renderW = baseW * scale;
    const renderH = baseH * scale;
    const offsetX = (this.width - renderW) / 2;
    const offsetY = (this.height - renderH) / 2 + panY;

    // Rocket nozzle in scene4 is located around normalized (0.575, 0.18)
    const nozzleX = offsetX + renderW * 0.575;
    const nozzleY = offsetY + renderH * 0.185;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    // 1. Dynamic Rocket Thruster Jet Flame & Blazing Core
    const flameFlicker = 1.0 + 0.18 * Math.sin(this.time * 24);
    const flameGrad = this.ctx.createRadialGradient(nozzleX, nozzleY, 4, nozzleX, nozzleY, 65 * flameFlicker);
    flameGrad.addColorStop(0, '#FFFFFF');
    flameGrad.addColorStop(0.2, '#FFF4B8');
    flameGrad.addColorStop(0.45, '#FF9E00');
    flameGrad.addColorStop(0.75, 'rgba(255, 69, 0, 0.4)');
    flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');

    this.ctx.fillStyle = flameGrad;
    this.ctx.beginPath();
    this.ctx.arc(nozzleX, nozzleY, 65 * flameFlicker, 0, Math.PI * 2);
    this.ctx.fill();

    // 2. High-speed jet exhaust plume pointing down-left along the rocket trajectory
    const jetLength = (70 + Math.random() * 30) * flameFlicker;
    const angleRad = Math.atan2(1, -0.62); // ~122 degrees (downward-left angle of the rocket body)
    const jetEndX = nozzleX + Math.cos(angleRad) * jetLength;
    const jetEndY = nozzleY + Math.sin(angleRad) * jetLength;

    const jetBeam = this.ctx.createLinearGradient(nozzleX, nozzleY, jetEndX, jetEndY);
    jetBeam.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    jetBeam.addColorStop(0.3, 'rgba(255, 200, 50, 0.85)');
    jetBeam.addColorStop(0.7, 'rgba(255, 80, 0, 0.45)');
    jetBeam.addColorStop(1, 'rgba(255, 30, 0, 0)');

    this.ctx.strokeStyle = jetBeam;
    this.ctx.lineWidth = 14 * flameFlicker;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(nozzleX, nozzleY);
    this.ctx.lineTo(jetEndX, jetEndY);
    this.ctx.stroke();

    // 3. Corkscrew spiral smoke and sparks billowing from the exhaust down the smoke column
    const spiralCount = 45;
    for (let i = 0; i < spiralCount; i++) {
      const t = i / spiralCount;
      const corkscrewAngle = (this.time * 14) - i * 0.45;
      const spiralRad = (8 + t * 45);

      // Follow the curved smoke trail seen in scene4
      const curveX = nozzleX - (t * renderW * 0.12) + Math.sin(t * Math.PI) * (renderW * 0.05);
      const curveY = nozzleY + (t * renderH * 0.45);

      const sx = curveX + Math.cos(corkscrewAngle) * spiralRad;
      const sy = curveY + Math.sin(corkscrewAngle) * (spiralRad * 0.5);

      const sparkAlpha = Math.max(0, (1 - t * 0.9) * 0.95);
      this.ctx.fillStyle = i % 2 === 0 ? `rgba(255, 215, 0, ${sparkAlpha})` : `rgba(255, 120, 0, ${sparkAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, 2 + (1 - t) * 4.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Bright white incandescent core specks
      if (Math.random() > 0.4) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha})`;
        this.ctx.beginPath();
        this.ctx.arc(sx + (Math.random() - 0.5) * 8, sy + (Math.random() - 0.5) * 4, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 4. Volumetric warm smoke clouds expanding downwards
    for (let s = 0; s < 6; s++) {
      const st = (s + 1) / 7;
      const smkX = nozzleX - (st * renderW * 0.10) + Math.sin(this.time * 2 + s) * 12;
      const smkY = nozzleY + (st * renderH * 0.38);
      const rad = 25 + st * 55;

      const smokeGrad = this.ctx.createRadialGradient(smkX, smkY, 0, smkX, smkY, rad);
      smokeGrad.addColorStop(0, 'rgba(255, 200, 120, 0.18)');
      smokeGrad.addColorStop(0.5, 'rgba(255, 150, 60, 0.08)');
      smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = smokeGrad;
      this.ctx.beginPath();
      this.ctx.arc(smkX, smkY, rad, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Screen vibration rumble increasing with launch ascent progress
    const rumble = (Math.random() - 0.5) * (4.0 * p);
    this.ctx.translate(rumble, rumble);
    this.ctx.restore();
  }

  // SCENE 5: Grand Diwali Skyburst & Website Intro Transition (80% - 100%)
  renderScene5_GrandDiwaliBurst(p, alpha = 1.0) {
    const cx = this.width / 2;
    const cy = this.height * 0.42;

    const scale = 1.0 + p * 0.08;
    this.drawImageCover(this.sceneImages.scene5, scale, 0, 0, alpha);

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    const burstProgress = Math.pow(p, 0.65);
    const maxRadius = Math.min(this.width, this.height) * 0.65;

    // Overlay Dynamic Concentric Firework Palms
    this.fireworkParticles.forEach(particle => {
      const dist = particle.speed * 40 * burstProgress;
      const x = cx + Math.cos(particle.angle) * dist;
      const grav = Math.pow(burstProgress, 2) * 26;
      const y = cy + Math.sin(particle.angle) * dist + grav;

      const pAlpha = Math.max(0, 1 - Math.pow(p, 1.5));
      const flicker = 0.75 + 0.25 * Math.sin(this.time * 8 + particle.flicker);

      const trailX = cx + Math.cos(particle.angle) * (dist * 0.85);
      const trailY = cy + Math.sin(particle.angle) * (dist * 0.85) + grav * 0.75;

      this.ctx.strokeStyle = particle.baseColor;
      this.ctx.globalAlpha = alpha * pAlpha * flicker * 0.65;
      this.ctx.lineWidth = particle.size * 0.85;
      this.ctx.beginPath();
      this.ctx.moveTo(trailX, trailY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      this.ctx.fillStyle = particle.baseColor;
      this.ctx.globalAlpha = alpha * pAlpha * flicker;
      this.ctx.beginPath();
      this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(x, y, particle.size * 0.45, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Radiant Golden Aura Shockwave blooming outward
    const auraRadius = maxRadius * burstProgress * 1.25;
    const aura = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(10, auraRadius));
    aura.addColorStop(0, `rgba(255, 235, 170, ${0.40 * (1 - p * 0.3)})`);
    aura.addColorStop(0.3, `rgba(255, 170, 0, ${0.25 * (1 - p * 0.25)})`);
    aura.addColorStop(0.7, `rgba(0, 245, 212, ${0.12 * (1 - p * 0.2)})`);
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');

    this.ctx.fillStyle = aura;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, Math.max(10, auraRadius), 0, Math.PI * 2);
    this.ctx.fill();

    // Central clear aperture framing the Utsav Bazaar hero reveal in dead center
    const clearVignette = this.ctx.createRadialGradient(cx, this.height * 0.50, 80, cx, this.height * 0.50, 420);
    clearVignette.addColorStop(0, 'rgba(0, 0, 0, 0.60)');
    clearVignette.addColorStop(0.65, 'rgba(0, 0, 0, 0.25)');
    clearVignette.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = clearVignette;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  // Draw exactly 3 non-disturbing, gentle golden festive hanging lights
  renderFairyLights(alpha = 1.0) {
    if (!this.fairyLights || this.fairyLights.length === 0) return;
    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    // 1. Draw single elegant catenary golden garland wire connecting the 3 lights
    this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    this.ctx.lineWidth = 1.4;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 35);

    this.fairyLights.forEach(l => {
      const baseX = l.xRatio * this.width;
      const baseY = l.yBase + Math.sin(this.time * 2 + l.phase) * 2;
      const curX = baseX + l.dispX;
      const curY = baseY + l.dispY;
      this.ctx.lineTo(curX, curY);
    });
    this.ctx.lineTo(this.width, 35);
    this.ctx.stroke();

    // 2. Draw the 3 warm golden bulbs
    this.fairyLights.forEach(l => {
      const baseX = l.xRatio * this.width;
      const baseY = l.yBase + Math.sin(this.time * 2 + l.phase) * 2;
      const curX = baseX + l.dispX;
      const curY = baseY + l.dispY;

      // Soft warm radial glow halo
      const glowRad = l.radius * 3.8;
      const radGrad = this.ctx.createRadialGradient(curX, curY, 0, curX, curY, glowRad);
      radGrad.addColorStop(0, l.color);
      radGrad.addColorStop(0.5, 'rgba(255, 170, 0, 0.25)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = radGrad;
      this.ctx.globalAlpha = alpha * l.glow;
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, glowRad, 0, Math.PI * 2);
      this.ctx.fill();

      // Brass bulb cap
      this.ctx.fillStyle = '#D4AF37';
      this.ctx.fillRect(curX - 2.5, curY - l.radius - 3, 5, 4);

      // Glass bulb core
      this.ctx.fillStyle = l.color;
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, l.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Bright warm incandescent filament center
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.beginPath();
      this.ctx.arc(curX, curY, l.radius * 0.45, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  drawFloatingEmbers(alpha = 1.0) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.floatingEmbers.forEach(e => {
      const px = e.x * this.width;
      const py = e.y * this.height;
      const flicker = 0.7 + 0.3 * Math.sin(this.time * 4 + e.x * 10);
      this.ctx.fillStyle = e.color;
      this.ctx.globalAlpha = alpha * e.alpha * flicker;
      this.ctx.beginPath();
      this.ctx.arc(px, py, e.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  renderAIFrame(img) {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawImageCover(img, 1.0, 0, 0);
  }
}
