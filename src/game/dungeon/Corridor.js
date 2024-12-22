// src/game/dungeon/Corridor.js

export class Corridor {
  constructor(startX, startY, endX, endY) {
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.type = 'corridor';
    this.path = [];
    this.generatePath();
  }

  generatePath() {
    this.path = [];
    let currentX = this.startX;
    let currentY = this.startY;

    // Add starting point
    this.path.push({ x: currentX, y: currentY });

    const horizontalFirst = Math.random() < 0.5;

    if (horizontalFirst) {
      // Go horizontal first
      while (currentX !== this.endX) {
        currentX += currentX < this.endX ? 1 : -1;
        this.path.push({ x: currentX, y: currentY });
      }
      // Then vertical
      while (currentY !== this.endY) {
        currentY += currentY < this.endY ? 1 : -1;
        this.path.push({ x: currentX, y: currentY });
      }
    } else {
      // Go vertical first
      while (currentY !== this.endY) {
        currentY += currentY < this.endY ? 1 : -1;
        this.path.push({ x: currentX, y: currentY });
      }
      // Then horizontal
      while (currentX !== this.endX) {
        currentX += currentX < this.endX ? 1 : -1;
        this.path.push({ x: currentX, y: currentY });
      }
    }
  }

  // Get the first few points of the path
  getStartPoints(count = 3) {
    return this.path.slice(0, count);
  }

  // Get the last few points of the path
  getEndPoints(count = 3) {
    return this.path.slice(-count);
  }
}
