// src/game/dungeon/DungeonGenerator.js

import { Room } from './Room.js';
import { Corridor } from './Corridor.js';

export class DungeonGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rooms = [];
    this.corridors = [];
    this.grid = Array(height).fill().map(() => Array(width).fill(0));
  }

  generate() {
    this.rooms = [];
    this.corridors = [];
    this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));

    this.generateRooms();
    this.connectRooms();
    this.applyToGrid();

    return {
      grid: this.grid,
      rooms: this.rooms,
      corridors: this.corridors
    };
  }

  generateRooms(attempts = 50) {
    for (let i = 0; i < attempts; i++) {
      const minSize = 5;
      const maxSize = 10;

      const width = minSize + Math.floor(Math.random() * (maxSize - minSize));
      const height = minSize + Math.floor(Math.random() * (maxSize - minSize));

      const x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - height - 2)) + 1;

      const newRoom = new Room(x, y, width, height);

      let overlaps = false;
      for (const room of this.rooms) {
        if (newRoom.intersects(room, 2)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        this.rooms.push(newRoom);
      }
    }
  }

  connectRooms() {
    const sortedRooms = [...this.rooms].sort((a, b) => a.x - b.x);

    for (let i = 0; i < sortedRooms.length - 1; i++) {
      const roomA = sortedRooms[i];
      const roomB = sortedRooms[i + 1];

      const centerA = roomA.getCenter();
      const centerB = roomB.getCenter();

      const corridor = new Corridor(centerA.x, centerA.y, centerB.x, centerB.y);
      this.corridors.push(corridor);
    }
  }

  applyToGrid() {
    // First pass: Apply rooms
    for (const room of this.rooms) {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          if (this.isInBounds(x, y)) {
            this.grid[y][x] = 1; // floor
          }
        }
      }
    }

    // Second pass: Apply corridors
    for (const corridor of this.corridors) {
      for (const point of corridor.path) {
        if (this.isInBounds(point.x, point.y)) {
          this.grid[point.y][point.x] = 1; // floor
        }
      }
    }

    // Third pass: Add walls
    const tempGrid = this.grid.map(row => [...row]);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (tempGrid[y][x] === 0) { // Empty space
          if (this.hasAdjacentFloor(x, y)) {
            this.grid[y][x] = 3; // wall
          }
        }
      }
    }

    // Fourth pass: Place doors
    console.log('Attempting to place doors...');
    this.placeDoors();
  }

  placeDoors() {
    for (const corridor of this.corridors) {
      let startSection = corridor.path.slice(1, 4);
      let endSection = corridor.path.slice(-4, -1);

      for (const point of [...startSection, ...endSection]) {
        if (this.shouldPlaceDoor(point.x, point.y)) {
          this.grid[point.y][point.x] = 2; // door tile value
        }
      }
    }
  }

  shouldPlaceDoor(x, y) {
    if (!this.isInBounds(x, y)) return false;

    // The point itself must be a floor tile
    if (this.grid[y][x] !== 1) return false;

    // Check horizontal door possibility (walls on north and south)
    const horizontalDoor =
      this.isInBounds(x, y - 1) && this.grid[y - 1][x] === 3 && // Wall above
      this.isInBounds(x, y + 1) && this.grid[y + 1][x] === 3 && // Wall below
      this.isInBounds(x - 1, y) && this.grid[y][x - 1] === 1 && // Floor left
      this.isInBounds(x + 1, y) && this.grid[y][x + 1] === 1;   // Floor right

    // Check vertical door possibility (walls on east and west)
    const verticalDoor =
      this.isInBounds(x - 1, y) && this.grid[y][x - 1] === 3 && // Wall left
      this.isInBounds(x + 1, y) && this.grid[y][x + 1] === 3 && // Wall right
      this.isInBounds(x, y - 1) && this.grid[y - 1][x] === 1 && // Floor above
      this.isInBounds(x, y + 1) && this.grid[y + 1][x] === 1;   // Floor below

    return horizontalDoor || verticalDoor;
  }

  hasAdjacentFloor(x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (this.isInBounds(nx, ny) && this.grid[ny][nx] === 1) {
          return true;
        }
      }
    }
    return false;
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}
