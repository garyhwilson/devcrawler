// src/game/dungeon/DungeonGenerator.js

import { Room } from './Room.js';
import { Corridor } from './Corridor.js';

export const RoomType = {
  STANDARD: 'standard',
  ENTRANCE: 'entrance',
  LARGE_HALL: 'largeHall',
  BOSS: 'boss',
  STORAGE: 'storage',
  TREASURE: 'treasure'
};

export class DungeonGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rooms = [];
    this.corridors = [];
    this.grid = Array(height).fill().map(() => Array(width).fill(0));
  }

  generate() {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      this.rooms = [];
      this.corridors = [];
      this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));

      if (this.generateRooms()) {
        this.connectRooms();
        this.assignRoomTypes();
        this.applyToGrid();

        return {
          grid: this.grid,
          rooms: this.rooms,
          corridors: this.corridors
        };
      }

      attempts++;
    }

    throw new Error('Failed to generate dungeon with minimum required rooms after multiple attempts');
  }

  generateRooms() {
    const minRooms = 5;
    const maxRooms = 10;
    const maxAttempts = 200;
    let totalAttempts = 0;

    // Clear any existing rooms
    this.rooms = [];

    // Define minimum and maximum room sizes
    const minSize = 4;  // Smaller minimum size
    const maxSize = 6;  // Smaller maximum size

    // Calculate grid divisions for better room distribution
    const gridDivisions = 3;
    const sectionWidth = Math.floor((this.width - 10) / gridDivisions);  // More padding
    const sectionHeight = Math.floor((this.height - 10) / gridDivisions); // More padding

    // Place entrance room in top-left section
    const entranceMinSize = Room.getMinSize(RoomType.ENTRANCE);
    const entranceRoom = new Room(2, 2, entranceMinSize.width, entranceMinSize.height);
    entranceRoom.setType(RoomType.ENTRANCE);
    this.rooms.push(entranceRoom);

    // Create sections, excluding the entrance section
    const sections = [];
    for (let y = 0; y < gridDivisions; y++) {
      for (let x = 0; x < gridDivisions; x++) {
        sections.push({ x, y }); // Include all sections for more placement opportunities
      }
    }

    // Shuffle sections for random placement order
    sections.sort(() => Math.random() - 0.5);

    // First phase: Try to place at least one room in each section
    for (const section of sections) {
      if (this.rooms.length >= maxRooms) break;

      let placed = false;
      let sectionAttempts = 0;
      const maxSectionAttempts = 20; // Increased attempts per section

      while (!placed && sectionAttempts < maxSectionAttempts) {
        const width = minSize + Math.floor(Math.random() * (Math.min(maxSize, sectionWidth - 4) - minSize));
        const height = minSize + Math.floor(Math.random() * (Math.min(maxSize, sectionHeight - 4) - minSize));

        const sectionX = 2 + (section.x * sectionWidth);
        const sectionY = 2 + (section.y * sectionHeight);

        // Add some randomness to room placement within section
        const x = sectionX + 2 + Math.floor(Math.random() * (sectionWidth - width - 4));
        const y = sectionY + 2 + Math.floor(Math.random() * (sectionHeight - height - 4));

        const newRoom = new Room(x, y, width, height);

        // Skip if trying to place in entrance section and not the entrance room
        if (section.x === 0 && section.y === 0 && !newRoom.type) {
          sectionAttempts++;
          continue;
        }

        if (this.canPlaceRoom(newRoom)) {
          this.rooms.push(newRoom);
          placed = true;
        }

        sectionAttempts++;
        totalAttempts++;
      }
    }

    // Second phase: Keep trying to add rooms until we reach minRooms
    while (this.rooms.length < minRooms && totalAttempts < maxAttempts) {
      const width = minSize + Math.floor(Math.random() * (maxSize - minSize));
      const height = minSize + Math.floor(Math.random() * (maxSize - minSize));

      // Try to place room in any valid location
      const x = 2 + Math.floor(Math.random() * (this.width - width - 4));
      const y = 2 + Math.floor(Math.random() * (this.height - height - 4));

      const newRoom = new Room(x, y, width, height);

      if (this.canPlaceRoom(newRoom)) {
        this.rooms.push(newRoom);
      }

      totalAttempts++;
    }

    // If we still don't have minimum rooms, try one last time with smaller rooms
    if (this.rooms.length < minRooms) {
      for (let i = 0; i < 20 && this.rooms.length < minRooms; i++) {
        const width = 4;  // Minimum size
        const height = 4; // Minimum size
        const x = 2 + Math.floor(Math.random() * (this.width - width - 4));
        const y = 2 + Math.floor(Math.random() * (this.height - height - 4));

        const newRoom = new Room(x, y, width, height);
        if (this.canPlaceRoom(newRoom)) {
          this.rooms.push(newRoom);
        }
      }
    }

    if (this.rooms.length < minRooms) {
      console.error(`Failed to generate minimum number of rooms. Got ${this.rooms.length}, needed ${minRooms}`);
      return false;
    }

    return true;
  }

  canPlaceRoom(newRoom) {
    // Check bounds
    if (!this.isRoomInBounds(newRoom)) {
      return false;
    }

    // Check overlaps with existing rooms (including padding)
    for (const room of this.rooms) {
      if (newRoom.intersects(room, 2)) {
        return false;
      }
    }

    return true;
  }

  isRoomInBounds(room) {
    return room.x >= 1 &&
      room.y >= 1 &&
      room.x + room.width < this.width - 1 &&
      room.y + room.height < this.height - 1;
  }

  connectRooms() {
    const sortedRooms = [...this.rooms].sort((a, b) => a.x - b.x);

    for (let i = 0; i < sortedRooms.length - 1; i++) {
      const roomA = sortedRooms[i];
      const roomB = sortedRooms[i + 1];

      // Connect the rooms with a single corridor
      this.createSingleCorridor(roomA, roomB);
    }
  }

  createSingleCorridor(roomA, roomB) {
    const startPoint = this.findBestExitPoint(roomA, roomB);
    const endPoint = this.findBestExitPoint(roomB, roomA);

    // Create the corridor
    const corridor = new Corridor(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

    // Remove points that are inside rooms
    corridor.path = corridor.path.filter(point =>
      !this.isPointInAnyRoom(point.x, point.y)
    );

    // Only proceed if corridor is long enough
    if (corridor.path.length < 4) return;

    // Find the actual intersection points with rooms
    const startDoor = this.findDoorPoint(corridor.path[0], roomA);
    const endDoor = this.findDoorPoint(corridor.path[corridor.path.length - 1], roomB);

    if (!startDoor || !endDoor) return;

    // Add the corridor to the grid
    corridor.path.forEach(point => {
      this.grid[point.y][point.x] = 1; // floor
    });

    // Add the doors
    this.grid[startDoor.y][startDoor.x] = 2; // door
    this.grid[endDoor.y][endDoor.x] = 2; // door

    this.corridors.push(corridor);
  }

  findBestExitPoint(room, targetRoom) {
    const roomCenter = room.getCenter();
    const targetCenter = targetRoom.getCenter();

    // Determine which edge to use
    let x = roomCenter.x < targetCenter.x ?
      room.x + room.width : // Use right edge
      room.x;               // Use left edge

    let y = roomCenter.y < targetCenter.y ?
      room.y + room.height : // Use bottom edge
      room.y;                // Use top edge

    // Stay within room bounds
    x = Math.max(room.x, Math.min(x, room.x + room.width));
    y = Math.max(room.y, Math.min(y, room.y + room.height));

    return { x, y };
  }

  findDoorPoint(corridorPoint, room) {
    // Check if the point is adjacent to the room
    const adjacentPoints = [
      { x: corridorPoint.x - 1, y: corridorPoint.y },
      { x: corridorPoint.x + 1, y: corridorPoint.y },
      { x: corridorPoint.x, y: corridorPoint.y - 1 },
      { x: corridorPoint.x, y: corridorPoint.y + 1 }
    ];

    // Find the point that intersects with the room
    for (const point of adjacentPoints) {
      if (this.isPointInRoom(point, room)) {
        return corridorPoint; // The corridor point becomes the door
      }
    }

    return null;
  }

  isPointInRoom(point, room) {
    return point.x >= room.x &&
      point.x < room.x + room.width &&
      point.y >= room.y &&
      point.y < room.y + room.height;
  }

  mergeIntersectingCorridors(corridors) {
    const merged = [];
    const used = new Set();

    for (let i = 0; i < corridors.length; i++) {
      if (used.has(i)) continue;

      let currentCorridor = { ...corridors[i] };
      used.add(i);

      let mergedAny;
      do {
        mergedAny = false;
        for (let j = 0; j < corridors.length; j++) {
          if (used.has(j)) continue;

          if (this.doCorridorsIntersect(currentCorridor, corridors[j])) {
            currentCorridor = this.mergeTwoCorridors(currentCorridor, corridors[j]);
            used.add(j);
            mergedAny = true;
          }
        }
      } while (mergedAny);

      merged.push(currentCorridor);
    }

    return merged;
  }

  doCorridorsIntersect(corridorA, corridorB) {
    return corridorA.path.some(pointA =>
      corridorB.path.some(pointB =>
        pointA.x === pointB.x && pointA.y === pointB.y));
  }

  mergeTwoCorridors(corridorA, corridorB) {
    // Create a set of all points to remove duplicates
    const allPoints = new Set(
      [...corridorA.path, ...corridorB.path].map(p => `${p.x},${p.y}`)
    );

    // Convert back to array of point objects
    const mergedPath = Array.from(allPoints).map(str => {
      const [x, y] = str.split(',').map(Number);
      return { x, y };
    });

    return {
      path: mergedPath,
      type: 'corridor'
    };
  }

  findValidDoorPointsForMergedCorridor(corridor) {
    const doorPoints = [];

    // For each point in the corridor
    corridor.path.forEach(point => {
      // Check if this point connects to any room
      const connectedRoom = this.findConnectedRoom(point);
      if (connectedRoom) {
        // Verify this is a valid door location
        if (this.isValidDoorLocation(point, corridor.path, connectedRoom)) {
          doorPoints.push(point);
        }
      }
    });

    return doorPoints;
  }

  findConnectedRoom(point) {
    return this.rooms.find(room =>
      point.x >= room.x - 1 && point.x <= room.x + room.width &&
      point.y >= room.y - 1 && point.y <= room.y + room.height
    );
  }

  isValidDoorLocation(point, corridorPath, room) {
    // Must be exactly at the room boundary
    const isAtBoundary =
      (point.x === room.x - 1 && point.y >= room.y && point.y < room.y + room.height) ||
      (point.x === room.x + room.width && point.y >= room.y && point.y < room.y + room.height) ||
      (point.y === room.y - 1 && point.x >= room.x && point.x < room.x + room.width) ||
      (point.y === room.y + room.height && point.x >= room.x && point.x < room.x + room.width);

    if (!isAtBoundary) return false;

    // Check that there's actual corridor (not just another room) on the other side
    const neighbors = this.getAdjacentPoints(point);
    const hasCorridorConnection = neighbors.some(n =>
      corridorPath.some(p => p.x === n.x && p.y === n.y) &&
      !this.isPointInAnyRoom(n.x, n.y)
    );

    return hasCorridorConnection;
  }

  createCorridorBetweenRooms(roomA, roomB) {
    const startPoint = this.findClosestDoorPoint(roomA, roomB);
    const endPoint = this.findClosestDoorPoint(roomB, roomA);

    const corridor = new Corridor(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
    corridor.path = corridor.path.filter(point => !this.isPointInAnyRoom(point.x, point.y));

    return corridor.path.length >= 4 ? corridor : null;
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
    // Sort rooms by size (excluding the entrance room which is already assigned)
    const sortedRooms = [...this.rooms]
      .filter(room => room.type !== RoomType.ENTRANCE)
      .sort((a, b) => (b.width * b.height) - (a.width * a.height));

    // Assign types based on size and position
    sortedRooms[0].setType(RoomType.LARGE_HALL);

    // Find the room farthest from entrance for boss
    const entranceRoom = this.rooms.find(room => room.type === RoomType.ENTRANCE);
    const farthestRoom = sortedRooms.reduce((farthest, room) => {
      if (room.type === RoomType.LARGE_HALL) return farthest;
      const distance = Math.sqrt(
        Math.pow(room.x - entranceRoom.x, 2) +
        Math.pow(room.y - entranceRoom.y, 2)
      );
      if (!farthest || distance > Math.sqrt(
        Math.pow(farthest.x - entranceRoom.x, 2) +
        Math.pow(farthest.y - entranceRoom.y, 2)
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
      // Only check the points where the corridor meets rooms
      const startPoint = corridor.path[0];
      const endPoint = corridor.path[corridor.path.length - 1];

      // Try to place doors at the ends of corridors
      if (this.shouldPlaceDoor(startPoint.x, startPoint.y)) {
        this.grid[startPoint.y][startPoint.x] = 2; // door tile value
      }

      if (this.shouldPlaceDoor(endPoint.x, endPoint.y)) {
        this.grid[endPoint.y][endPoint.x] = 2; // door tile value
      }
    }
  }

  shouldPlaceDoor(x, y) {
    if (!this.isInBounds(x, y)) return false;

    // The point itself must be a floor tile
    if (this.grid[y][x] !== 1) return false;

    // Check if there's already a door nearby
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (this.isInBounds(nx, ny) && this.grid[ny][nx] === 2) {
          return false; // Door too close
        }
      }
    }

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
