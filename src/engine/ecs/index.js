// src/engine/ecs/index.js

// Unique identifier generator for entities
let nextEntityId = 0;

export class Entity {
  constructor() {
    this.id = nextEntityId++;
    this.components = new Map();
    this.tags = new Set();
  }

  addComponent(component) {
    this.components.set(component.constructor.name, component);
    return this;
  }

  removeComponent(componentClass) {
    this.components.delete(componentClass.name);
    return this;
  }

  getComponent(componentClass) {
    return this.components.get(componentClass.name);
  }

  hasComponent(componentClass) {
    return this.components.has(componentClass.name);
  }

  addTag(tag) {
    this.tags.add(tag);
    return this;
  }

  removeTag(tag) {
    this.tags.delete(tag);
    return this;
  }

  hasTag(tag) {
    return this.tags.has(tag);
  }
}

// Base class for all components
export class Component {
  constructor(data = {}) {
    Object.assign(this, data);
  }
}

// System base class
export class System {
  constructor(world) {
    this.world = world;
    this.requiredComponents = new Set();
    this.priority = 0;
  }

  // Define which components are required for this system
  addRequirement(componentClass) {
    this.requiredComponents.add(componentClass.name);
    return this;
  }

  // Check if an entity has all required components
  matchesRequirements(entity) {
    for (const req of this.requiredComponents) {
      if (!entity.components.has(req)) return false;
    }
    return true;
  }

  // Get all entities that match the requirements
  getValidEntities() {
    return this.world.entities.filter(entity => this.matchesRequirements(entity));
  }

  // Update method to be implemented by child classes
  update(deltaTime) {
    throw new Error('Update method must be implemented by child class');
  }
}

// World class to manage all entities and systems
export class World {
  constructor() {
    this.entities = [];
    this.systems = [];
    this.entitiesToAdd = [];
    this.entitiesToRemove = new Set();
    this.lastUpdateTime = performance.now();
  }

  addEntity(entity) {
    this.entitiesToAdd.push(entity);
    return entity;
  }

  removeEntity(entity) {
    this.entitiesToRemove.add(entity);
  }

  addSystem(system) {
    this.systems.push(system);
    // Sort systems by priority
    this.systems.sort((a, b) => b.priority - a.priority);
    return system;
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;

    // Add new entities
    while (this.entitiesToAdd.length > 0) {
      this.entities.push(this.entitiesToAdd.pop());
    }

    // Remove queued entities
    if (this.entitiesToRemove.size > 0) {
      this.entities = this.entities.filter(entity => !this.entitiesToRemove.has(entity));
      this.entitiesToRemove.clear();
    }

    // Update all systems
    for (const system of this.systems) {
      system.update(deltaTime);
    }
  }

  // Query entities with specific components
  queryEntities(...componentClasses) {
    const componentNames = componentClasses.map(c => c.name);
    return this.entities.filter(entity => {
      return componentNames.every(name => entity.components.has(name));
    });
  }

  // Find single entity by tag
  findEntityByTag(tag) {
    return this.entities.find(entity => entity.hasTag(tag));
  }

  // Get all entities with a specific tag
  getEntitiesByTag(tag) {
    return this.entities.filter(entity => entity.hasTag(tag));
  }
}

// Common component types
export class TransformComponent extends Component {
  constructor(x = 0, y = 0, rotation = 0) {
    super();
    this.x = x;
    this.y = y;
    this.rotation = rotation;
  }
}

export class SpriteComponent extends Component {
  constructor(spriteSheet, frameWidth, frameHeight) {
    super();
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.animationSpeed = 0;
    this.animations = new Map();
    this.currentAnimation = null;
  }

  addAnimation(name, frames, speed) {
    this.animations.set(name, { frames, speed });
    return this;
  }

  playAnimation(name, loop = true) {
    const animation = this.animations.get(name);
    if (animation && this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrame = animation.frames[0];
      this.animationSpeed = animation.speed;
      this.totalFrames = animation.frames.length;
      this.loop = loop;
    }
  }
}

export class CollisionComponent extends Component {
  constructor(width, height, layer = 0) {
    super();
    this.width = width;
    this.height = height;
    this.layer = layer;
    this.solid = true;
  }
}

export class VelocityComponent extends Component {
  constructor(vx = 0, vy = 0) {
    super();
    this.vx = vx;
    this.vy = vy;
  }
}

// Base class for state machine states
export class State {
  constructor(entity) {
    this.entity = entity;
  }

  enter() { }
  exit() { }
  update(deltaTime) { }
}

// State machine component
export class StateMachineComponent extends Component {
  constructor() {
    super();
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
  }

  addState(name, stateClass) {
    this.states.set(name, stateClass);
    return this;
  }

  setState(name) {
    if (!this.states.has(name)) return false;

    if (this.currentState) {
      this.currentState.exit();
      this.previousState = this.currentState;
    }

    const StateClass = this.states.get(name);
    this.currentState = new StateClass(this.entity);
    this.currentState.enter();
    return true;
  }

  update(deltaTime) {
    if (this.currentState) {
      this.currentState.update(deltaTime);
    }
  }
}
