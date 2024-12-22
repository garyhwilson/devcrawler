// src/game/dungeon/RoomColors.js

import { RoomType } from './Room.js';
export const RoomColors = {
  [RoomType.STANDARD]: '#444',    // Standard gray
  [RoomType.ENTRANCE]: '#4a9',    // Teal
  [RoomType.LARGE_HALL]: '#66a',  // Purple-blue
  [RoomType.BOSS]: '#a44',        // Dark red
  [RoomType.STORAGE]: '#974',     // Tan
  [RoomType.TREASURE]: '#aa4',    // Gold
  'corridor': '#335',             // Dark blue-gray
  'wall': '#666',                 // Light gray
  'door': {
    'open': '#4a2',             // Green
    'closed': '#8b4513'         // Brown
  }
};
