// src/engine/AssetManager.js

export class AssetManager {
  constructor() {
    // Asset storage
    this.images = new Map();
    this.sprites = new Map();
    this.spritesheets = new Map();
    this.sounds = new Map();
    this.loadingPromises = new Map();
    this.loaded = false;
  }

  async loadAssets(assetManifest) {
    try {
      // Track all loading promises
      const promises = [];

      // Load images and sprites
      if (assetManifest.images) {
        promises.push(...this.loadImages(assetManifest.images));
      }

      if (assetManifest.sprites) {
        promises.push(...this.loadSprites(assetManifest.sprites));
      }

      if (assetManifest.spritesheets) {
        promises.push(...this.loadSpritesheets(assetManifest.spritesheets));
      }

      // Wait for all assets to load
      await Promise.all(promises);
      this.loaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load assets:', error);
      throw error;
    }
  }

  loadImages(imageManifest) {
    const promises = [];

    for (const [key, path] of Object.entries(imageManifest)) {
      // Skip if already loading or loaded
      if (this.loadingPromises.has(key) || this.images.has(key)) {
        continue;
      }

      const promise = this.loadImage(key, path);
      this.loadingPromises.set(key, promise);
      promises.push(promise);
    }

    return promises;
  }

  loadSprites(spriteManifest) {
    const promises = [];

    for (const [key, data] of Object.entries(spriteManifest)) {
      if (this.loadingPromises.has(key) || this.sprites.has(key)) {
        continue;
      }

      const promise = this.loadSprite(key, data);
      this.loadingPromises.set(key, promise);
      promises.push(promise);
    }

    return promises;
  }

  loadSpritesheets(sheetManifest) {
    const promises = [];

    for (const [key, data] of Object.entries(sheetManifest)) {
      if (this.loadingPromises.has(key) || this.spritesheets.has(key)) {
        continue;
      }

      const promise = this.loadSpritesheet(key, data);
      this.loadingPromises.set(key, promise);
      promises.push(promise);
    }

    return promises;
  }

  async loadImage(key, path) {
    try {
      const image = new Image();
      const promise = new Promise((resolve, reject) => {
        image.onload = () => {
          this.images.set(key, image);
          this.loadingPromises.delete(key);
          resolve(image);
        };
        image.onerror = () => {
          this.loadingPromises.delete(key);
          reject(new Error(`Failed to load image: ${path}`));
        };
      });

      image.src = path;
      return promise;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  async loadSprite(key, data) {
    try {
      const { path, frameWidth, frameHeight, animations } = data;
      const image = await this.loadImage(`${key}_img`, path);

      const sprite = {
        image,
        frameWidth,
        frameHeight,
        animations: new Map(),
        totalFrames: Math.floor((image.width / frameWidth) * (image.height / frameHeight))
      };

      // Set up animations if provided
      if (animations) {
        for (const [animName, animData] of Object.entries(animations)) {
          sprite.animations.set(animName, {
            frames: animData.frames,
            frameRate: animData.frameRate,
            loop: animData.loop !== false
          });
        }
      }

      this.sprites.set(key, sprite);
      this.loadingPromises.delete(key);
      return sprite;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  async loadSpritesheet(key, data) {
    try {
      const { path, frameWidth, frameHeight, frames, spacing = 0, margin = 0 } = data;
      const image = await this.loadImage(`${key}_img`, path);

      const spritesheet = {
        image,
        frameWidth,
        frameHeight,
        frames: [],
        spacing,
        margin
      };

      // Calculate frame positions
      const columns = Math.floor((image.width - margin * 2 + spacing) / (frameWidth + spacing));
      const rows = Math.floor((image.height - margin * 2 + spacing) / (frameHeight + spacing));

      // Generate frame data
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const frameIndex = y * columns + x;
          if (frames && !frames.includes(frameIndex)) continue;

          spritesheet.frames.push({
            x: margin + x * (frameWidth + spacing),
            y: margin + y * (frameHeight + spacing),
            width: frameWidth,
            height: frameHeight
          });
        }
      }

      this.spritesheets.set(key, spritesheet);
      this.loadingPromises.delete(key);
      return spritesheet;
    } catch (error) {
      this.loadingPromises.delete(key);
      throw error;
    }
  }

  getImage(key) {
    return this.images.get(key);
  }

  getSprite(key) {
    return this.sprites.get(key);
  }

  getSpritesheet(key) {
    return this.spritesheets.get(key);
  }

  getSpriteFrame(spriteKey, frameIndex) {
    const sprite = this.sprites.get(spriteKey);
    if (!sprite) return null;

    const framesPerRow = Math.floor(sprite.image.width / sprite.frameWidth);
    const row = Math.floor(frameIndex / framesPerRow);
    const col = frameIndex % framesPerRow;

    return {
      x: col * sprite.frameWidth,
      y: row * sprite.frameHeight,
      width: sprite.frameWidth,
      height: sprite.frameHeight
    };
  }

  getAnimationFrames(spriteKey, animationName) {
    const sprite = this.sprites.get(spriteKey);
    if (!sprite || !sprite.animations) return null;

    return sprite.animations.get(animationName);
  }

  isLoaded() {
    return this.loaded && this.loadingPromises.size === 0;
  }

  getLoadingProgress() {
    const totalAssets = this.images.size + this.sprites.size + this.spritesheets.size + this.loadingPromises.size;
    const loadedAssets = this.images.size + this.sprites.size + this.spritesheets.size;
    return totalAssets > 0 ? loadedAssets / totalAssets : 1;
  }

  // Clean up resources
  dispose() {
    this.images.clear();
    this.sprites.clear();
    this.spritesheets.clear();
    this.loadingPromises.clear();
    this.loaded = false;
  }
}
