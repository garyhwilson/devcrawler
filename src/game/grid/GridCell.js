// src/game/grid/GridCell.js

export class GridCell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.type = 'floor';
    this.walkable = true;
    this.transparent = true;
    this.visible = false;
    this.explored = false;
    this.entities = new Set();
    this.properties = new Map();
    this.isDoor = false;
    this.isOpen = false;
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

    switch (type) {
      case 'wall':
        this.walkable = false;
        this.transparent = false;
        this.isDoor = false;
        break;
      case 'door':
        this.isDoor = true;
        this.isOpen = Math.random() < 0.2; // 20% chance to start open
        this.walkable = this.isOpen;
        this.transparent = this.isOpen;
        break;
      case 'floor':
        this.walkable = true;
        this.transparent = true;
        this.isDoor = false;
        break;
      default:
        console.warn(`Unknown cell type: ${type}`);
    }
  }

  toggleDoor() {
    if (!this.isDoor) return false;

    this.isOpen = !this.isOpen;
    this.walkable = this.isOpen;
    this.transparent = this.isOpen;
    return true;
  }
}
