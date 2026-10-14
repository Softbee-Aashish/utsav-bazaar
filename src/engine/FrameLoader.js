// AI Frame Sequence Preloader & Drag-and-Drop Loader for Utsav Bazaar

export class FrameLoader {
  constructor(options = {}) {
    this.totalFramesExpected = options.totalFrames || 60;
    this.frames = [];
    this.isLoaded = false;
    this.isLoading = false;
    this.hasCustomFrames = false;
    this.onProgress = options.onProgress || (() => {});
    this.onLoaded = options.onLoaded || (() => {});
  }

  // Check if predefined AI frames are in the assets directory
  async probeAssetsDirectory() {
    const testPaths = [
      'assets/frames/frame_001.jpg',
      'assets/frames/frame_0001.png',
      'assets/frames/scene1_001.jpg'
    ];

    for (const path of testPaths) {
      try {
        const found = await this.testImageLoad(path);
        if (found) {
          console.log(`Found AI frame sequence at ${path}, starting full sequence load...`);
          await this.loadSequenceFromPattern('assets/frames/frame_%03d.jpg', 60);
          return true;
        }
      } catch (e) {
        // Continue probing
      }
    }
    return false;
  }

  testImageLoad(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async loadSequenceFromPattern(pattern, count) {
    this.isLoading = true;
    this.frames = new Array(count);
    let loadedCount = 0;

    const promises = [];
    for (let i = 1; i <= count; i++) {
      const p = new Promise((resolve) => {
        const img = new Image();
        const paddedIndex = String(i).padStart(3, '0');
        img.src = pattern.replace('%03d', paddedIndex);
        img.onload = () => {
          this.frames[i - 1] = img;
          loadedCount++;
          this.onProgress(loadedCount / count);
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
      });
      promises.push(p);
    }

    await Promise.all(promises);
    const validFrames = this.frames.filter(Boolean);
    if (validFrames.length > 10) {
      this.isLoaded = true;
      this.hasCustomFrames = true;
      this.onLoaded(this.frames);
    } else {
      this.isLoaded = false;
      this.hasCustomFrames = false;
    }
    this.isLoading = false;
  }

  // Allow user to drag-and-drop or select an extracted image sequence folder
  loadFromFiles(fileList) {
    const imageFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    // Natural sort: frame_1.jpg, frame_2.jpg, ... frame_10.jpg
    imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    this.frames = [];
    let loadedCount = 0;
    const total = imageFiles.length;

    imageFiles.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.frames[idx] = img;
          loadedCount++;
          this.onProgress(loadedCount / total);
          if (loadedCount === total) {
            this.isLoaded = true;
            this.hasCustomFrames = true;
            this.onLoaded(this.frames);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  getFrameForProgress(progress) {
    if (!this.hasCustomFrames || this.frames.length === 0) return null;
    const frameIndex = Math.floor(progress * (this.frames.length - 1));
    return this.frames[Math.max(0, Math.min(this.frames.length - 1, frameIndex))];
  }
}
