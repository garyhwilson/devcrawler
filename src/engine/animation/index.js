// src/engine/animation/index.js

export class Animation {
  constructor(name, frames, frameRate, loop = true) {
    this.name = name;
    this.frames = frames;
    this.frameRate = frameRate;
    this.loop = loop;
    this.frameTime = 1 / frameRate;
    this.totalDuration = this.frameTime * frames.length;
  }

  getFrameAt(time) {
    if (!this.loop && time >= this.totalDuration) {
      return this.frames[this.frames.length - 1];
    }

    const loopTime = this.loop ? time % this.totalDuration : time;
    const frameIndex = Math.floor(loopTime / this.frameTime);
    return this.frames[frameIndex % this.frames.length];
  }
}

export class AnimationController {
  constructor() {
    this.animations = new Map();
    this.currentAnimation = null;
    this.currentTime = 0;
    this.isPlaying = false;
    this.onComplete = null;
    this.onLoop = null;
    this.onFrame = null;
  }

  addAnimation(name, frames, frameRate, loop = true) {
    this.animations.set(name, new Animation(name, frames, frameRate, loop));
    return this;
  }

  play(name, resetTime = true) {
    const animation = this.animations.get(name);
    if (!animation) {
      console.warn(`Animation '${name}' not found`);
      return false;
    }

    if (this.currentAnimation?.name !== name || resetTime) {
      this.currentTime = 0;
    }

    this.currentAnimation = animation;
    this.isPlaying = true;
    return true;
  }

  stop() {
    this.isPlaying = false;
    this.currentTime = 0;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    if (this.currentAnimation) {
      this.isPlaying = true;
    }
  }

  update(deltaTime) {
    if (!this.isPlaying || !this.currentAnimation) return;

    const previousFrame = this.getCurrentFrame();
    const previousLoop = Math.floor(this.currentTime / this.currentAnimation.totalDuration);

    this.currentTime += deltaTime;

    const currentFrame = this.getCurrentFrame();
    const currentLoop = Math.floor(this.currentTime / this.currentAnimation.totalDuration);

    // Check for animation completion
    if (!this.currentAnimation.loop &&
      this.currentTime >= this.currentAnimation.totalDuration) {
      this.isPlaying = false;
      if (this.onComplete) {
        this.onComplete(this.currentAnimation.name);
      }
    }

    // Check for loop completion
    if (currentLoop > previousLoop && this.onLoop) {
      this.onLoop(this.currentAnimation.name, currentLoop);
    }

    // Check for frame change
    if (currentFrame !== previousFrame && this.onFrame) {
      this.onFrame(this.currentAnimation.name, currentFrame);
    }
  }

  getCurrentFrame() {
    if (!this.currentAnimation) return null;
    return this.currentAnimation.getFrameAt(this.currentTime);
  }

  setFrameRate(name, frameRate) {
    const animation = this.animations.get(name);
    if (animation) {
      animation.frameRate = frameRate;
      animation.frameTime = 1 / frameRate;
      animation.totalDuration = animation.frameTime * animation.frames.length;
    }
  }
}

export class SpriteAnimator {
  constructor(spriteSheet, frameWidth, frameHeight) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.controller = new AnimationController();
    this.flipX = false;
    this.flipY = false;
    this.rotation = 0;
    this.opacity = 1;
    this.tint = null;
  }

  draw(ctx, x, y, width = this.frameWidth, height = this.frameHeight) {
    const currentFrame = this.controller.getCurrentFrame();
    if (!currentFrame || !this.spriteSheet.complete) return;

    const framesPerRow = Math.floor(this.spriteSheet.width / this.frameWidth);
    const sourceX = (currentFrame % framesPerRow) * this.frameWidth;
    const sourceY = Math.floor(currentFrame / framesPerRow) * this.frameHeight;

    ctx.save();

    // Apply transformations
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(this.rotation);
    ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
    ctx.globalAlpha = this.opacity;

    // Apply tint if specified
    if (this.tint) {
      // Create a temporary canvas for tinting
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.frameWidth;
      tempCanvas.height = this.frameHeight;
      const tempCtx = tempCanvas.getContext('2d');

      // Draw the sprite frame
      tempCtx.drawImage(
        this.spriteSheet,
        sourceX, sourceY,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.frameWidth, this.frameHeight
      );

      // Apply tint
      tempCtx.fillStyle = this.tint;
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.fillRect(0, 0, this.frameWidth, this.frameHeight);

      // Reset composite operation and draw the tinted image
      tempCtx.globalCompositeOperation = 'destination-atop';
      tempCtx.drawImage(
        this.spriteSheet,
        sourceX, sourceY,
        this.frameWidth, this.frameHeight,
        0, 0,
        this.frameWidth, this.frameHeight
      );

      // Draw the tinted sprite
      ctx.drawImage(
        tempCanvas,
        -width / 2, -height / 2,
        width, height
      );
    } else {
      // Draw the sprite normally
      ctx.drawImage(
        this.spriteSheet,
        sourceX, sourceY,
        this.frameWidth, this.frameHeight,
        -width / 2, -height / 2,
        width, height
      );
    }

    ctx.restore();
  }

  update(deltaTime) {
    this.controller.update(deltaTime);
  }
}

// Animation state machine for managing character states
export class AnimationStateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.defaultState = null;
    this.animator = null;
  }

  addState(name, animationName, { enter, exit, update } = {}) {
    this.states.set(name, {
      name,
      animationName,
      enter: enter || (() => { }),
      exit: exit || (() => { }),
      update: update || (() => { }),
      transitions: new Map()
    });

    if (!this.defaultState) {
      this.defaultState = name;
    }

    return this;
  }

  addTransition(fromState, toState, condition) {
    const state = this.states.get(fromState);
    if (state) {
      state.transitions.set(toState, condition);
    }
    return this;
  }

  setAnimator(animator) {
    this.animator = animator;
    return this;
  }

  setState(name) {
    const newState = this.states.get(name);
    if (!newState) return false;

    if (this.currentState) {
      this.currentState.exit();
    }

    this.currentState = newState;
    this.currentState.enter();

    if (this.animator) {
      this.animator.controller.play(newState.animationName);
    }

    return true;
  }

  update(deltaTime) {
    if (!this.currentState) {
      this.setState(this.defaultState);
      return;
    }

    // Update current state
    this.currentState.update(deltaTime);

    // Check transitions
    for (const [toState, condition] of this.currentState.transitions) {
      if (condition()) {
        this.setState(toState);
        break;
      }
    }

    // Update animator
    if (this.animator) {
      this.animator.update(deltaTime);
    }
  }
}
