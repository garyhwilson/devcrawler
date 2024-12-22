// src/game/dungeon/Room.js

export const RoomType = {
  STANDARD: 'standard',
  ENTRANCE: 'entrance',
  LARGE_HALL: 'largeHall',
  BOSS: 'boss',
  STORAGE: 'storage',
  TREASURE: 'treasure'
};

export class Room {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.doors = [];
    this.type = RoomType.STANDARD;
    this.features = new Map();

    // Additional properties for special rooms
    this.isLocked = false;
    this.requiredKey = null;
    this.contents = new Set(); // For items, monsters, etc.
  }

  intersects(other, padding = 0) {
    return !(this.x + this.width + padding < other.x ||
      other.x + other.width + padding < this.x ||
      this.y + this.height + padding < other.y ||
      other.y + other.height + padding < this.y);
  }

  getCenter() {
    return {
      x: Math.floor(this.x + this.width / 2),
      y: Math.floor(this.y + this.height / 2)
    };
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }

  addDoor(x, y, type = 'normal') {
    this.doors.push({ x, y, type });
  }

  // Get minimum size requirements for each room type
  static getMinSize(type) {
    switch (type) {
      case RoomType.LARGE_HALL:
        return { width: 12, height: 12 };
      case RoomType.BOSS:
        return { width: 15, height: 15 };
      case RoomType.STORAGE:
        return { width: 5, height: 5 };
      case RoomType.TREASURE:
        return { width: 7, height: 7 };
      case RoomType.ENTRANCE:
        return { width: 8, height: 8 };
      default:
        return { width: 6, height: 6 };
    }
  }

  setType(type) {
    this.type = type;
    // Apply type-specific properties
    switch (type) {
      case RoomType.TREASURE:
        this.isLocked = true;
        this.requiredKey = 'treasure_key';
        break;
      case RoomType.BOSS:
        this.isLocked = true;
        break;
      case RoomType.ENTRANCE:
        // Entrance should always be accessible
        this.isLocked = false;
        break;
    }
    return this;
  }

  // Generate a room of specific type
  static generate(type, availableWidth, availableHeight, padding = 2) {
    const minSize = Room.getMinSize(type);
    let width, height;

    switch (type) {
      case RoomType.LARGE_HALL:
        width = minSize.width + Math.floor(Math.random() * 4);
        height = minSize.height + Math.floor(Math.random() * 4);
        break;
      case RoomType.BOSS:
        width = minSize.width + Math.floor(Math.random() * 5);
        height = minSize.height + Math.floor(Math.random() * 5);
        break;
      case RoomType.STORAGE:
        width = minSize.width + Math.floor(Math.random() * 2);
        height = minSize.height + Math.floor(Math.random() * 2);
        break;
      case RoomType.TREASURE:
        width = minSize.width + Math.floor(Math.random() * 3);
        height = minSize.height + Math.floor(Math.random() * 3);
        break;
      case RoomType.ENTRANCE:
        width = minSize.width;
        height = minSize.height;
        break;
      default: // STANDARD
        width = minSize.width + Math.floor(Math.random() * 4);
        height = minSize.height + Math.floor(Math.random() * 4);
    }

    // Ensure room fits in available space
    width = Math.min(width, availableWidth - padding * 2);
    height = Math.min(height, availableHeight - padding * 2);

    // Position room
    const x = padding + Math.floor(Math.random() * (availableWidth - width - padding * 2));
    const y = padding + Math.floor(Math.random() * (availableHeight - height - padding * 2));

    const room = new Room(x, y, width, height);
    room.setType(type);
    return room;
  }
}
