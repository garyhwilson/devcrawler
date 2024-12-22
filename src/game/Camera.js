export class Camera {
  constructor(width, height, worldWidth, worldHeight, tileSize) {
    this.width = width;
    this.height = height;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.tileSize = tileSize;
    this.x = 0;
    this.y = 0;

    // Calculate the number of tiles that can be displayed
    this.tilesX = Math.floor(width / tileSize);
    this.tilesY = Math.floor(height / tileSize);

    // Scroll threshold in tiles (5 tiles from edge)
    this.scrollThreshold = 5;
  }

  // Update camera position based on target (player) position
  follow(targetX, targetY) {
    // Convert target position to screen space
    const screenX = (targetX * this.tileSize) - this.x;
    const screenY = (targetY * this.tileSize) - this.y;

    // Check if target is too close to screen edges
    if (screenX < this.scrollThreshold * this.tileSize) {
      this.x = (targetX * this.tileSize) - (this.scrollThreshold * this.tileSize);
    }
    if (screenX > this.width - (this.scrollThreshold * this.tileSize)) {
      this.x = (targetX * this.tileSize) - this.width + (this.scrollThreshold * this.tileSize);
    }
    if (screenY < this.scrollThreshold * this.tileSize) {
      this.y = (targetY * this.tileSize) - (this.scrollThreshold * this.tileSize);
    }
    if (screenY > this.height - (this.scrollThreshold * this.tileSize)) {
      this.y = (targetY * this.tileSize) - this.height + (this.scrollThreshold * this.tileSize);
    }

    // Clamp camera position to world bounds
    this.x = Math.max(0, Math.min(this.x, (this.worldWidth * this.tileSize) - this.width));
    this.y = Math.max(0, Math.min(this.y, (this.worldHeight * this.tileSize) - this.height));
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX * this.tileSize) - this.x,
      y: (worldY * this.tileSize) - this.y
    };
  }

  // Check if a tile is visible on screen
  isVisible(worldX, worldY) {
    const screenPos = this.worldToScreen(worldX, worldY);
    return screenPos.x >= -this.tileSize &&
      screenPos.x <= this.width &&
      screenPos.y >= -this.tileSize &&
      screenPos.y <= this.height;
  }
}
