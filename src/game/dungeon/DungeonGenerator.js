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

      const connection = this.findBestConnection(roomA, roomB);
      if (!connection) continue;

      const { corridor, doorPoints } = connection;

      // Add corridor and doors
      this.corridors.push(corridor);
      doorPoints.forEach(point => {
        this.grid[point.y][point.x] = 2; // door
      });
    }
  }

  findBestConnection(roomA, roomB) {
    // Try different connection strategies
    const strategies = [
      { dx: 0, dy: 0 },    // Direct
      { dx: 0, dy: 1 },    // Offset up
      { dx: 0, dy: -1 },   // Offset down
      { dx: 1, dy: 0 },    // Offset right
      { dx: -1, dy: 0 }    // Offset left
    ];

    for (const { dx, dy } of strategies) {
      // Find potential connection points
      const startPoint = this.findConnectionPoint(roomA, roomB, dx, dy);
      const endPoint = this.findConnectionPoint(roomB, roomA, -dx, -dy);

      // Create and validate corridor
      const corridor = new Corridor(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

      // Remove room intersections
      corridor.path = corridor.path.filter(point =>
        !this.isPointInAnyRoom(point.x, point.y));

      // Validate corridor
      if (corridor.path.length >= 4 && this.isValidCorridor(corridor)) {
        // Find door placement points
        const doorPoints = this.getDoorPoints(corridor, roomA, roomB);
        if (doorPoints.length === 2) { // Ensure exactly two doors
          return { corridor, doorPoints };
        }
      }
    }
    return null;
  }

  findConnectionPoint(room, targetRoom, offsetX, offsetY) {
    const roomCenter = room.getCenter();
    const targetCenter = targetRoom.getCenter();

    // Determine which edge to use based on relative position
    let x, y;

    if (roomCenter.x < targetCenter.x) {
      x = room.x + room.width - 1; // Right edge
    } else {
      x = room.x; // Left edge
    }

    if (roomCenter.y < targetCenter.y) {
      y = room.y + room.height - 1; // Bottom edge
    } else {
      y = room.y; // Top edge
    }

    // Apply offset
    x += offsetX;
    y += offsetY;

    return { x, y };
  }

  isValidCorridor(corridor) {
    // Check minimum length
    if (corridor.path.length < 4) return false;

    // Check for nearby doors or other corridors
    for (const point of corridor.path) {
      const neighbors = this.getAdjacentPoints(point);
      for (const neighbor of neighbors) {
        // Check if neighbor is a door or part of another corridor
        if (this.grid[neighbor.y][neighbor.x] === 2) return false;
      }
    }

    return true;
  }

  findDoorPlacementPoints(corridor) {
    const doorPoints = [];

    // Check start of corridor
    const startSegment = corridor.path.slice(0, 3);
    const validStart = this.isValidDoorPlacement(startSegment[1], corridor);
    if (validStart) {
      doorPoints.push(startSegment[1]);
    }

    // Check end of corridor
    const endSegment = corridor.path.slice(-3);
    const validEnd = this.isValidDoorPlacement(endSegment[1], corridor);
    if (validEnd) {
      doorPoints.push(endSegment[1]);
    }

    return doorPoints;
  }

  findClosestDoorPoint(roomA, roomB) {
    // Find the edge of roomA that's closest to roomB
    const centerA = roomA.getCenter();
    const centerB = roomB.getCenter();

    let x, y;

    if (centerA.x < centerB.x) {
      x = roomA.x + roomA.width - 1; // Right edge
    } else {
      x = roomA.x; // Left edge
    }

    if (centerA.y < centerB.y) {
      y = roomA.y + roomA.height - 1; // Bottom edge
    } else {
      y = roomA.y; // Top edge
    }

    return { x, y };
  }

  isPointInAnyRoom(x, y) {
    return this.rooms.some(room =>
      x >= room.x && x < room.x + room.width &&
      y >= room.y && y < room.y + room.height
    );
  }

  getAdjacentPoints(point) {
    const neighbors = [];
    const deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (const [dx, dy] of deltas) {
      const x = point.x + dx;
      const y = point.y + dy;
      if (this.isInBounds(x, y)) {
        neighbors.push({ x, y });
      }
    }

    return neighbors;
  }

  getDoorPoints(corridor, roomA, roomB) {
    const doorPoints = [];

    // Check first and last points of corridor
    const start = corridor.path[0];
    const end = corridor.path[corridor.path.length - 1];

    // Only add door points that are actually connecting to rooms
    if (this.isAdjacentToRoom(start, roomA)) doorPoints.push(start);
    if (this.isAdjacentToRoom(end, roomB)) doorPoints.push(end);

    return doorPoints;
  }

  isAdjacentToRoom(point, room) {
    return point.x >= room.x - 1 &&
      point.x <= room.x + room.width &&
      point.y >= room.y - 1 &&
      point.y <= room.y + room.height;
  }

  isValidDoorPlacement(point, corridor) {
    // Check if there's enough space around the door
    const neighboringCells = [
      { x: point.x - 1, y: point.y },
      { x: point.x + 1, y: point.y },
      { x: point.x, y: point.y - 1 },
      { x: point.x, y: point.y + 1 }
    ];

    // Count how many corridor cells are adjacent
    const corridorNeighbors = neighboringCells.filter(cell =>
      corridor.path.some(p => p.x === cell.x && p.y === cell.y)
    );

    // Only place door if it connects exactly two spaces
    // (one corridor side and one room side)
    return corridorNeighbors.length === 1;
  }

  assignRoomTypes() {
    // Sort rooms by size
    const sortedRooms = [...this.rooms].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height));

    // Assign types based on size and position
    sortedRooms[0].setType(RoomType.LARGE_HALL);

    // Find the room closest to top-left for entrance
    const topLeftRoom = this.rooms.reduce((closest, room) => {
      const distance = Math.sqrt(room.x * room.x + room.y * room.y);
      if (!closest || distance < Math.sqrt(closest.x * closest.x + closest.y * closest.y)) {
        return room;
      }
      return closest;
    });
    topLeftRoom.setType(RoomType.ENTRANCE);

    // Find the room farthest from entrance for boss
    const farthestRoom = this.rooms.reduce((farthest, room) => {
      const distance = Math.sqrt(
        Math.pow(room.x - topLeftRoom.x, 2) +
        Math.pow(room.y - topLeftRoom.y, 2)
      );
      if (!farthest || distance > Math.sqrt(
        Math.pow(farthest.x - topLeftRoom.x, 2) +
        Math.pow(farthest.y - topLeftRoom.y, 2)
      )) {
        return room;
      }
      return farthest;
    });
    farthestRoom.setType(RoomType.BOSS);

    // Assign remaining rooms randomly
    const remainingTypes = [RoomType.STORAGE, RoomType.TREASURE, RoomType.STANDARD];
    this.rooms.forEach(room => {
      if (!room.type || room.type === RoomType.STANDARD) {
        const randomType = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];
        room.setType(randomType);
      }
    });
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
