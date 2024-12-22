// src/game/grid/GridManager.js
import { GridCell } from './GridCell.js';

export class GridManager {
  constructor(width, height, tileSize = 32) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.grid = this.createGrid();
  }

  createGrid() {
    const grid = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      grid[y] = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = new GridCell(x, y);
      }
    }
    return grid;
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  getCell(x, y) {
    if (!this.isInBounds(x, y)) return null;
    return this.grid[y][x];
  }

  // Movement validation
  canMoveTo(x, y) {
    const cell = this.getCell(x, y);
    if (!cell) return false;
    return cell.walkable && !cell.hasBlockingEntity();
  }

  // Coordinate conversion
  gridToScreen(gridX, gridY) {
    return {
      x: gridX * this.tileSize,
      y: gridY * this.tileSize
    };
  }

  screenToGrid(screenX, screenY) {
    return {
      x: Math.floor(screenX / this.tileSize),
      y: Math.floor(screenY / this.tileSize)
    };
  }

  // Get all neighbors of a cell
  getNeighbors(x, y, includeDiagonals = false) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 },  // Up
      { x: 1, y: 0 },   // Right
      { x: 0, y: 1 },   // Down
      { x: -1, y: 0 }   // Left
    ];

    if (includeDiagonals) {
      directions.push(
        { x: 1, y: -1 },  // Up-Right
        { x: 1, y: 1 },   // Down-Right
        { x: -1, y: 1 },  // Down-Left
        { x: -1, y: -1 }  // Up-Left
      );
    }

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;
      const cell = this.getCell(newX, newY);
      if (cell) neighbors.push(cell);
    }

    return neighbors;
  }

  // Get walkable neighbors (for pathfinding)
  getWalkableNeighbors(x, y, includeDiagonals = false) {
    return this.getNeighbors(x, y, includeDiagonals)
      .filter(cell => this.canMoveTo(cell.x, cell.y));
  }

  // Line of sight check
  hasLineOfSight(x1, y1, x2, y2) {
    // Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      if (x === x2 && y === y2) return true;

      const cell = this.getCell(x, y);
      if (!cell || !cell.transparent) return false;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  // Get all cells within a certain range
  getCellsInRange(centerX, centerY, range) {
    const cells = [];
    for (let y = centerY - range; y <= centerY + range; y++) {
      for (let x = centerX - range; x <= centerX + range; x++) {
        const cell = this.getCell(x, y);
        if (cell) {
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) +
            Math.pow(y - centerY, 2)
          );
          if (distance <= range) {
            cells.push(cell);
          }
        }
      }
    }
    return cells;
  }

  resetVisibility() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x].visible = false;
      }
    }
  }

  clear() {
    this.grid = this.createGrid();
  }
}
