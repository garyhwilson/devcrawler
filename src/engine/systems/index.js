// src/engine/systems/index.js

import { System, TransformComponent, SpriteComponent, VelocityComponent, CollisionComponent } from '../ecs';

// Handles rendering of all entities with sprites
export class RenderSystem extends System {
  constructor(world, ctx, camera) {
    super(world);
    this.ctx = ctx;
    this.camera = camera;
    this.addRequirement(TransformComponent)
      .addRequirement(SpriteComponent);
    this.priority = 100; // Render last
  }

  update(deltaTime) {
    // Clear the canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Get all entities with required components
    const entities = this.getValidEntities();

    // Sort entities by y position for proper layering
    entities.sort((a, b) => {
      const transformA = a.getComponent(TransformComponent);
      const transformB = b.getComponent(TransformComponent);
      return transformA.y - transformB.y;
    });

    // Render each entity
    for (const entity of entities) {
      this.renderEntity(entity);
    }
  }

  renderEntity(entity) {
    const transform = entity.getComponent(TransformComponent);
    const sprite = entity.getComponent(SpriteComponent);

    // Skip if sprite sheet not loaded
    if (!sprite.spriteSheet.complete) return;

    // Get screen position
    const screenPos = this.camera.worldToScreen(transform.x, transform.y);

    // Skip if not visible on screen
    if (!this.camera.isVisible(transform.x, transform.y)) return;

    // Calculate source rectangle (for sprite animation)
    const sourceX = (sprite.currentFrame % sprite.spriteSheet.width) * sprite.frameWidth;
    const sourceY = Math.floor(sprite.currentFrame / sprite.spriteSheet.width) * sprite.frameHeight;

    // Draw the sprite
    this.ctx.save();
    this.ctx.translate(screenPos.x + sprite.frameWidth / 2, screenPos.y + sprite.frameHeight / 2);
    this.ctx.rotate(transform.rotation);
    this.ctx.drawImage(
      sprite.spriteSheet,
      sourceX, sourceY,
      sprite.frameWidth, sprite.frameHeight,
      -sprite.frameWidth / 2, -sprite.frameHeight / 2,
      sprite.frameWidth, sprite.frameHeight
    );
    this.ctx.restore();
  }
}

// Handles animation updates
export class AnimationSystem extends System {
  constructor(world) {
    super(world);
    this.addRequirement(SpriteComponent);
    this.priority = 90;
  }

  update(deltaTime) {
    const entities = this.getValidEntities();

    for (const entity of entities) {
      const sprite = entity.getComponent(SpriteComponent);
      if (!sprite.currentAnimation) continue;

      const animation = sprite.animations.get(sprite.currentAnimation);
      if (!animation) continue;

      // Update animation frame
      sprite.animationTime = (sprite.animationTime || 0) + deltaTime;
      if (sprite.animationTime >= animation.speed) {
        sprite.animationTime = 0;
        const currentIndex = animation.frames.indexOf(sprite.currentFrame);
        const nextIndex = (currentIndex + 1) % animation.frames.length;

        if (!sprite.loop && nextIndex === 0) {
          sprite.currentAnimation = null;
        } else {
          sprite.currentFrame = animation.frames[nextIndex];
        }
      }
    }
  }
}

// Handles movement and velocity
export class MovementSystem extends System {
  constructor(world) {
    super(world);
    this.addRequirement(TransformComponent)
      .addRequirement(VelocityComponent);
    this.priority = 80;
  }

  update(deltaTime) {
    const entities = this.getValidEntities();

    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent);
      const velocity = entity.getComponent(VelocityComponent);

      // Update position based on velocity
      transform.x += velocity.vx * deltaTime;
      transform.y += velocity.vy * deltaTime;
    }
  }
}

// Handles collision detection and response
export class CollisionSystem extends System {
  constructor(world, gridManager) {
    super(world);
    this.gridManager = gridManager;
    this.addRequirement(TransformComponent)
      .addRequirement(CollisionComponent);
    this.priority = 70;
  }

  update(deltaTime) {
    const entities = this.getValidEntities();

    // Check entity-grid collisions
    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent);
      const collision = entity.getComponent(CollisionComponent);

      // Get grid cells that this entity overlaps
      const gridX = Math.floor(transform.x);
      const gridY = Math.floor(transform.y);

      // Check surrounding cells
      for (let y = gridY - 1; y <= gridY + 1; y++) {
        for (let x = gridX - 1; x <= gridX + 1; x++) {
          const cell = this.gridManager.getCell(x, y);
          if (!cell || !cell.walkable) {
            // Handle collision with walls/obstacles
            this.resolveGridCollision(entity, x, y);
          }
        }
      }
    }

    // Check entity-entity collisions
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        if (this.checkCollision(entityA, entityB)) {
          this.resolveCollision(entityA, entityB);
        }
      }
    }
  }

  checkCollision(entityA, entityB) {
    const transformA = entityA.getComponent(TransformComponent);
    const collisionA = entityA.getComponent(CollisionComponent);
    const transformB = entityB.getComponent(TransformComponent);
    const collisionB = entityB.getComponent(CollisionComponent);

    // Skip if entities are on different layers
    if (collisionA.layer !== collisionB.layer) return false;

    // AABB collision check
    return (
      transformA.x < transformB.x + collisionB.width &&
      transformA.x + collisionA.width > transformB.x &&
      transformA.y < transformB.y + collisionB.height &&
      transformA.y + collisionA.height > transformB.y
    );
  }

  resolveGridCollision(entity, gridX, gridY) {
    const transform = entity.getComponent(TransformComponent);
    const collision = entity.getComponent(CollisionComponent);

    // Calculate overlap and push entity out of wall
    const entityCenterX = transform.x + collision.width / 2;
    const entityCenterY = transform.y + collision.height / 2;
    const gridCenterX = gridX + 0.5;
    const gridCenterY = gridY + 0.5;

    const dx = entityCenterX - gridCenterX;
    const dy = entityCenterY - gridCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
      transform.x += dx > 0 ? 1 : -1;
    } else {
      transform.y += dy > 0 ? 1 : -1;
    }

    // Stop velocity in collision direction
    const velocity = entity.getComponent(VelocityComponent);
    if (velocity) {
      if (Math.abs(dx) > Math.abs(dy)) {
        velocity.vx = 0;
      } else {
        velocity.vy = 0;
      }
    }
  }

  resolveCollision(entityA, entityB) {
    // Implement specific collision response based on entity types
    if (entityA.hasTag('player') && entityB.hasTag('monster')) {
      // Handle player-monster collision
      this.handleCombatCollision(entityA, entityB);
    } else if (entityA.hasTag('player') && entityB.hasTag('item')) {
      // Handle item pickup
      this.handleItemPickup(entityA, entityB);
    }
    // Add more collision responses as needed
  }

  handleCombatCollision(playerEntity, monsterEntity) {
    // Combat logic will be implemented later
  }

  handleItemPickup(playerEntity, itemEntity) {
    // Item pickup logic will be implemented later
  }
}
