// src/game/grid/GridCell.js
export class GridCell {
  constructor(x, y) {
    // Position
    this.x = x;
    this.y = y;

    // Basic properties
    this.type = 'floor';  // floor, wall, door, stairs-up, stairs-down
    this.walkable = true;
    this.transparent = true;  // For line of sight calculations

    // Visibility properties
    this.visible = false;  // Currently in field of view
    this.explored = false; // Has been seen before

    // Gameplay properties
    this.entities = new Set();  // Entities in this cell (monsters, items, etc.)

    // Special properties
    this.properties = new Map();  // For doors: locked, requires_key, etc.
  }

  // Entity management
  addEntity(entity) {
    this.entities.add(entity);
    return this;
  }

  removeEntity(entity) {
    this.entities.delete(entity);
    return this;
  }

  hasBlockingEntity() {
    return Array.from(this.entities).some(entity => entity.blocking);
  }

  // Property management
  setProperty(key, value) {
    this.properties.set(key, value);
    return this;
  }

  getProperty(key) {
    return this.properties.get(key);
  }

  hasProperty(key) {
    return this.properties.has(key);
  }

  // Cell type management
  setType(type) {
    this.type = type;
    // Update walkable and transparent based on type
    switch (type) {
      case 'wall':
        this.walkable = false;
        this.transparent = false;
        break;
      case 'door':
        this.walkable = this.getProperty('open') || false;
        this.transparent = this.getProperty('open') || false;
        break;
      case 'floor':
      case 'stairs-up':
      case 'stairs-down':
        this.walkable = true;
        this.transparent = true;
        break;
      default:
        console.warn(`Unknown cell type: ${type}`);
    }
    return this;
  }
}
