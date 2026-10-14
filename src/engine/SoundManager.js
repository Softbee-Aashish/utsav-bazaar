// Web Audio API Procedural Sound Engine for Utsav Bazaar
// Generates realistic foley sound effects and ambient festive soundscape with zero external audio dependencies

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isInitialized = false;
    this.ambientGain = null;
    this.ambientOscillators = [];
    this.lastTriggeredScene = -1;
    this.sizzleNode = null;
    this.melodyTimer = null;
    this.isMelodyPlaying = false;
    this.reverbNode = null;
    this.beatTimer = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      this.setupMasterGain();
      this.setupDelayEffect();
      console.log("Web Audio Engine initialized for Utsav Bazaar");
    } catch (err) {
      console.warn("Web Audio not supported or blocked", err);
    }
  }

  setupDelayEffect() {
    if (!this.ctx || this.reverbNode) return;
    try {
      // Gentle warm festive courtyard echo for flute and chimes
      const delay = this.ctx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.32, this.ctx.currentTime);

      const feedback = this.ctx.createGain();
      feedback.gain.setValueAtTime(0.35, this.ctx.currentTime);

      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = "lowpass";
      delayFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

      delay.connect(delayFilter);
      delayFilter.connect(feedback);
      feedback.connect(delay);

      const delayOut = this.ctx.createGain();
      delayOut.gain.setValueAtTime(0.28, this.ctx.currentTime);
      delayFilter.connect(delayOut);
      delayOut.connect(this.masterGain);

      this.reverbNode = { input: delay, output: delayOut };
    } catch (e) {
      console.warn("Delay setup error", e);
    }
  }

  setupMasterGain() {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.65, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.65;
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }

    if (!this.isMuted) {
      this.startFestiveAmbient();
      this.startSweetMelody();
    } else {
      this.stopFestiveAmbient();
      this.stopSweetMelody();
    }

    return !this.isMuted;
  }

  // Create a white noise buffer for realistic percussion, friction, and explosion effects
  createNoiseBuffer(duration = 1.0) {
    if (!this.ctx) return null;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Foley 1: Distinct Matchbox Strike Friction ("shhhk")
  playMatchStrike() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;

      // Friction scrape (Noise filtered through bandpass)
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.28);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2800, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + 0.25);
      filter.Q.setValueAtTime(3.5, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.28);

      // Micro wooden snap transient
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      oscGain.gain.setValueAtTime(0.5, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {
      console.warn("Sound effect error", e);
    }
  }

  // Foley 2: Sizzling Fuse Spark Hiss ("tszzzz-k-k-k")
  startFuseSizzle() {
    if (!this.ctx || this.isMuted || this.sizzleNode) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(1.5);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(4200, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      this.sizzleNode = { noise, gain };
    } catch (e) {
      console.warn(e);
    }
  }

  stopFuseSizzle() {
    if (this.sizzleNode && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.sizzleNode.gain.gain.linearRampToValueAtTime(0.001, t + 0.1);
        setTimeout(() => {
          if (this.sizzleNode) {
            this.sizzleNode.noise.stop();
            this.sizzleNode.noise.disconnect();
            this.sizzleNode = null;
          }
        }, 120);
      } catch (e) {
        this.sizzleNode = null;
      }
    }
  }

  // Foley 3: Skyward Rocket Flight Whistle & Thrust
  // Acoustics: Predominantly high-frequency between 3.0 kHz and 7.5 kHz.
  // Sharp resonant peaks at 3.2 kHz, 5.0 kHz, and 7.0 kHz. Almost no noise below 3.0 kHz.
  playRocketLaunch() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const duration = 1.6;

      // 1. High-frequency noise cluster (3.0 kHz to 7.5 kHz)
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(duration);

      // Strict highpass at 3000 Hz: Eliminates all low buzz below 3.0 kHz
      const hpFilter = this.ctx.createBiquadFilter();
      hpFilter.type = "highpass";
      hpFilter.frequency.setValueAtTime(3000, t);

      // Lowpass ceiling at 7500 Hz
      const lpFilter = this.ctx.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.setValueAtTime(7500, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, t);
      noiseGain.gain.linearRampToValueAtTime(0.28, t + 0.3);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, t + duration);

      noise.connect(hpFilter);
      hpFilter.connect(lpFilter);
      lpFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + duration);

      // 2. Sharp resonant whistle peaks peaking at 3.2 kHz, 5.0 kHz, and 7.0 kHz
      const peakFreqs = [3200, 5000, 7000];
      peakFreqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = "sine";

        // Slight dynamic pitch modulation as chemical fuel burns down
        const burnMod = 1 + (idx * 0.04);
        osc.frequency.setValueAtTime(freq * 0.96, t);
        osc.frequency.exponentialRampToValueAtTime(freq * burnMod, t + duration * 0.85);

        // Sharp bandpass filter for narrow resonance peak
        const bpFilter = this.ctx.createBiquadFilter();
        bpFilter.type = "bandpass";
        bpFilter.frequency.setValueAtTime(freq, t);
        bpFilter.Q.setValueAtTime(14.0, t); // High Q for sharp whistling spike

        const peakVol = (idx === 0 ? 0.22 : (idx === 1 ? 0.16 : 0.10));
        oscGain.gain.setValueAtTime(0.01, t);
        oscGain.gain.linearRampToValueAtTime(peakVol, t + 0.25);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(bpFilter);
        bpFilter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);
      });
    } catch (e) {
      console.warn("Rocket flight whistle error:", e);
    }
  }

  // Foley 4: Grand Diwali Skyburst Detonation ("BAAAM" + sparkling glitter crackles)
  playFireworkBoom() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Heavy Sub-bass punch (The physical air thump)
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(120, t);
      sub.frequency.exponentialRampToValueAtTime(38, t + 0.4);

      subGain.gain.setValueAtTime(1.0, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      sub.connect(subGain);
      subGain.connect(this.masterGain);

      sub.start(t);
      sub.stop(t + 1.3);

      // 2. Explosion Body (Deep rumbling noise)
      const blastNoise = this.ctx.createBufferSource();
      blastNoise.buffer = this.createNoiseBuffer(2.2);

      const blastFilter = this.ctx.createBiquadFilter();
      blastFilter.type = "lowpass";
      blastFilter.frequency.setValueAtTime(1200, t);
      blastFilter.frequency.exponentialRampToValueAtTime(160, t + 1.8);

      const blastGain = this.ctx.createGain();
      blastGain.gain.setValueAtTime(0.9, t);
      blastGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

      blastNoise.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(this.masterGain);

      blastNoise.start(t);
      blastNoise.stop(t + 2.2);

      // 3. Shimmering Gold Glitter Crackles (Concentric burst particles)
      for (let i = 0; i < 7; i++) {
        const delay = 0.35 + Math.random() * 0.9;
        setTimeout(() => {
          if (!this.ctx || this.isMuted) return;
          const ct = this.ctx.currentTime;
          const popNoise = this.ctx.createBufferSource();
          popNoise.buffer = this.createNoiseBuffer(0.12);

          const popFilter = this.ctx.createBiquadFilter();
          popFilter.type = "bandpass";
          popFilter.frequency.setValueAtTime(2500 + Math.random() * 3000, ct);
          popFilter.Q.setValueAtTime(5.0, ct);

          const popGain = this.ctx.createGain();
          popGain.gain.setValueAtTime(0.3, ct);
          popGain.gain.exponentialRampToValueAtTime(0.01, ct + 0.1);

          popNoise.connect(popFilter);
          popFilter.connect(popGain);
          popGain.connect(this.masterGain);

          popNoise.start(ct);
          popNoise.stop(ct + 0.12);
        }, delay * 1000);
      }

      // 4. Celebration Chimes / Bells
      this.playCelebrationChime();
    } catch (e) {
      console.warn(e);
    }
  }

  // Foley 5: Cardboard Box Sliding Latch
  playBoxSlide() {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.35);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(650, t);
      filter.frequency.linearRampToValueAtTime(450, t + 0.3);
      filter.Q.setValueAtTime(2.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.35);
    } catch (e) {
      console.warn(e);
    }
  }

  // Celestial Temple Chimes (revealing the Utsav Bazaar logo)
  playCelebrationChime() {
    if (!this.ctx || this.isMuted) return;
    const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6 (Festive Bilawal/Kalyan harmonic)
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 1.9);
      }, idx * 120);
    });
  }

  // Soft Festive Tanpura/Sitar Ambient Harmonic Drone (Soothing, meditative, zero harsh buzzing)
  startFestiveAmbient() {
    if (!this.ctx || this.ambientGain) return;
    try {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      // Soft gentle volume (no loud buzzing)
      this.ambientGain.gain.linearRampToValueAtTime(0.045, this.ctx.currentTime + 2.0);
      this.ambientGain.connect(this.masterGain);

      // Lowpass filter to ensure completely smooth, warm, mellow tone
      const mellowFilter = this.ctx.createBiquadFilter();
      mellowFilter.type = "lowpass";
      mellowFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
      mellowFilter.connect(this.ambientGain);

      // Harmonically pleasant Sa-Pa-Sa fifths (pure sine waves)
      const freqs = [146.83, 220.00, 293.66, 440.00];
      this.ambientOscillators = freqs.map((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        const nodeGain = this.ctx.createGain();
        nodeGain.gain.value = 0.22 / freqs.length;

        osc.connect(nodeGain);
        nodeGain.connect(mellowFilter);
        osc.start();

        return { osc };
      });
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  }

  stopFestiveAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
        setTimeout(() => {
          if (this.ambientOscillators) {
            this.ambientOscillators.forEach(({ osc }) => {
              try {
                if (osc) osc.stop();
              } catch (e) {}
            });
            this.ambientOscillators = [];
          }
          this.ambientGain = null;
        }, 900);
      } catch (e) {
        this.ambientGain = null;
      }
    }
  }

  // Continuous Sweet Bansuri (Bamboo Flute) & Slower Soulful Devotional Melody with Slight Festive Beat
  startSweetMelody() {
    if (!this.ctx || this.isMelodyPlaying) return;
    this.isMelodyPlaying = true;

    // Start subtle acoustic festive rhythm beat (Tabla / Mridangam gentle groove)
    this.startFestiveBeat();

    // Slower, deeply soulful, meditative pentatonic sequence: Sa, Re, Ga, Pa, Dha, Sa' (Raga Bhupali)
    const melodyPhrases = [
      // Phrase 1: Slow, gentle uplifting ascent
      { f: 329.63, d: 2.2, vel: 0.17 }, // Ga (E4)
      { f: 392.00, d: 2.0, vel: 0.19 }, // Pa (G4)
      { f: 440.00, d: 2.8, vel: 0.22 }, // Dha (A4 - long singing note)
      { f: 523.25, d: 3.2, vel: 0.24 }, // Sa' (C5 - high peak resonance)
      { f: 440.00, d: 2.1, vel: 0.19 }, // Dha (A4)
      { f: 392.00, d: 2.6, vel: 0.20 }, // Pa (G4)

      // Phrase 2: Gentle descending waves with serene grace
      { f: 329.63, d: 1.9, vel: 0.18 }, // Ga (E4)
      { f: 293.66, d: 1.8, vel: 0.16 }, // Re (D4)
      { f: 261.63, d: 3.2, vel: 0.22 }, // Sa (C4 - deep calm root)
      { f: 293.66, d: 1.8, vel: 0.17 }, // Re (D4)
      { f: 329.63, d: 2.4, vel: 0.19 }, // Ga (E4)
      { f: 392.00, d: 2.2, vel: 0.20 }, // Pa (G4)
      { f: 440.00, d: 2.4, vel: 0.21 }, // Dha (A4)
      { f: 392.00, d: 2.5, vel: 0.19 }, // Pa (G4)
      { f: 329.63, d: 2.0, vel: 0.17 }, // Ga (E4)
      { f: 293.66, d: 2.4, vel: 0.16 }, // Re (D4)
      { f: 261.63, d: 4.2, vel: 0.23 }, // Sa (C4 - long serene meditative resolution)
    ];

    let noteIdx = 0;
    const playNext = () => {
      if (!this.isMelodyPlaying || this.isMuted || !this.ctx) return;
      const note = melodyPhrases[noteIdx];
      this.playFluteNote(note.f, note.d, note.vel);

      noteIdx = (noteIdx + 1) % melodyPhrases.length;
      // Generous, unhurried timing between notes for a slow peaceful tempo
      const nextDelay = (note.d * 1.15 + 0.45) * 1000;
      this.melodyTimer = setTimeout(playNext, nextDelay);
    };

    playNext();
  }

  stopSweetMelody() {
    this.isMelodyPlaying = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    this.stopFestiveBeat();
  }

  // Gentle, subtle rhythmic beat underneath the melody (approx 62 BPM, slow Keherwa cycle)
  startFestiveBeat() {
    if (!this.ctx || this.beatTimer) return;

    const beatInterval = 960; // Slow, relaxing 960ms beat interval
    let step = 0;

    const playBeatStep = () => {
      if (!this.isMelodyPlaying || this.isMuted || !this.ctx) return;

      switch (step) {
        case 0: // Beat 1: Gentle low Bayan bass thump + soft wood click
          this.playTablaBass(0.12);
          this.playTablaClick(0.05);
          break;
        case 1: // Beat 2: Light Dayan ceramic / bell tap
          this.playTablaRim(0.07);
          break;
        case 2: // Beat 3: Gentle soft mid-drum tap
          this.playTablaSoft(0.08);
          break;
        case 3: // Beat 4: Resonant Dayan rim tap
          this.playTablaRim(0.07);
          break;
      }

      step = (step + 1) % 4;
      this.beatTimer = setTimeout(playBeatStep, beatInterval);
    };

    playBeatStep();
  }

  stopFestiveBeat() {
    if (this.beatTimer) {
      clearTimeout(this.beatTimer);
      this.beatTimer = null;
    }
  }

  // Soft Indian Bayan Bass Pulse (Gentle, warm rounded sub-bass pitch drop)
  playTablaBass(velocity = 0.12) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(94, t);
      osc.frequency.exponentialRampToValueAtTime(68, t + 0.28);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.58);
    } catch (e) {}
  }

  // Soft Dayan Rim Bell / Ceramic Tap
  playTablaRim(velocity = 0.07) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(680, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.24);
    } catch (e) {}
  }

  // Soft Mid-drum Tap
  playTablaSoft(velocity = 0.08) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(210, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.18);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.34);
    } catch (e) {}
  }

  // Micro wooden rim click
  playTablaClick(velocity = 0.05) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.05);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, t);
      filter.Q.setValueAtTime(4.0, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(velocity, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(t);
      noise.stop(t + 0.06);
    } catch (e) {}
  }

  playFluteNote(freq, duration, velocity = 0.18) {
    if (!this.ctx || this.isMuted) return;
    try {
      const t = this.ctx.currentTime;

      // 1. Primary Flute Tone (Sine with soft Meend pitch slide)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";

      // Authentic Indian Bansuri "Meend" (slight micro-glide up to target pitch)
      osc.frequency.setValueAtTime(freq * 0.985, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

      // Soft envelope (gentle attack, singing sustain, smooth decay)
      oscGain.gain.setValueAtTime(0.0001, t);
      oscGain.gain.linearRampToValueAtTime(velocity, t + 0.07);
      oscGain.gain.setValueAtTime(velocity * 0.85, t + duration * 0.7);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      // 2. Second Harmonic for wooden warmth
      const harm2 = this.ctx.createOscillator();
      const harmGain = this.ctx.createGain();
      harm2.type = "sine";
      harm2.frequency.setValueAtTime(freq * 2, t);
      harmGain.gain.setValueAtTime(0.0001, t);
      harmGain.gain.linearRampToValueAtTime(velocity * 0.22, t + 0.07);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, t + duration * 0.85);

      // Lowpass mellow filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, t);

      osc.connect(oscGain);
      harm2.connect(harmGain);
      oscGain.connect(filter);
      harmGain.connect(filter);

      filter.connect(this.masterGain);
      if (this.reverbNode) {
        filter.connect(this.reverbNode.input);
      }

      osc.start(t);
      harm2.start(t);
      osc.stop(t + duration + 0.05);
      harm2.stop(t + duration + 0.05);
    } catch (e) {
      console.warn("Flute note error", e);
    }
  }

  // Trigger appropriate sound based on scroll scene transition
  handleSceneTransition(sceneIndex) {
    if (this.lastTriggeredScene === sceneIndex) return;
    this.lastTriggeredScene = sceneIndex;

    switch (sceneIndex) {
      case 0:
        // Scene 1: Street run
        this.stopFuseSizzle();
        break;
      case 1:
        // Scene 2: Box opening
        this.stopFuseSizzle();
        this.playBoxSlide();
        break;
      case 2:
        // Scene 3: Match strike & fuse ignition
        this.playMatchStrike();
        setTimeout(() => this.startFuseSizzle(), 250);
        break;
      case 3:
        // Scene 4: Rocket launches into sky
        this.stopFuseSizzle();
        this.playRocketLaunch();
        break;
      case 4:
        // Scene 5: Grand Diwali Skyburst
        this.stopFuseSizzle();
        this.playFireworkBoom();
        break;
    }
  }
}

export const soundManager = new SoundManager();
