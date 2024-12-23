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

    // Always go horizontal first, then vertical
    // This creates more predictable corridors
    while (currentX !== this.endX) {
      currentX += currentX < this.endX ? 1 : -1;
      this.path.push({ x: currentX, y: currentY });
    }

    while (currentY !== this.endY) {
      currentY += currentY < this.endY ? 1 : -1;
      this.path.push({ x: currentX, y: currentY });
    }
  }
}
