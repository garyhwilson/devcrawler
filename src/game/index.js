// src/game/index.js

import { GridManager } from './grid/GridManager.js';
import { DungeonGenerator } from './dungeon/DungeonGenerator.js';
import { Camera } from './Camera.js';
import { RoomType } from './dungeon/Room.js';
import { RoomColors } from './dungeon/RoomColors.js';

class GameManager {
  constructor() {
    console.log('GameManager initializing...');

    try {
      // Initialize canvas
      this.canvas = document.getElementById('gameCanvas');
      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }

      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        throw new Error('Could not get 2D context');
      }

      // Constants
      const GRID_WIDTH = 50;  // World size
      const GRID_HEIGHT = 50;
      const TILE_SIZE = 16;

      // Set fixed canvas size (won't scale with window)
      this.canvas.width = 800;   // Show 50 tiles at 16px each
      this.canvas.height = 600;  // Show 37.5 tiles vertically

      // Initialize camera
      this.camera = new Camera(
        this.canvas.width,
        this.canvas.height,
        GRID_WIDTH,
        GRID_HEIGHT,
        TILE_SIZE
      );

      // Initial canvas setup
      this.ctx.imageSmoothingEnabled = false;

      // Create grid system
      this.gridManager = new GridManager(GRID_WIDTH, GRID_HEIGHT, TILE_SIZE);

      // Create dungeon generator
      this.dungeonGenerator = new DungeonGenerator(GRID_WIDTH, GRID_HEIGHT);

      // Initialize room type tracking
      this.roomTypes = new Map(); // Stores coordinates -> room type

      // Set up game state
      this.lastFrameTime = 0;
      this.frameCount = 0;

      // Player state
      this.playerPos = { x: 0, y: 0 };
      this.playerFacing = { x: 0, y: -1 }; // Initially facing north

      // Generate initial dungeon and place player
      this.generateNewDungeon();

      // Bind event handlers
      this.handleKeyDown = this.handleKeyDown.bind(this);

      // Add key event listeners
      window.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
          this.generateNewDungeon();
          event.preventDefault();
        } else {
          this.handleKeyDown(event);
        }
      });

      // Add legend
      this.addLegend();

      // Start game loop
      console.log('Starting game loop...');
      this.gameLoop(0);

      // Hide loading screen
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }

      // Add instructions
      this.addInstructions();

    } catch (error) {
      console.error('Game initialization error:', error);
      throw error;
    }
  }

  addLegend() {
    const legend = document.createElement('div');
    legend.style.position = 'absolute';
    legend.style.top = '10px';
    legend.style.right = '10px';
    legend.style.color = 'white';
    legend.style.fontFamily = 'monospace';
    legend.style.fontSize = '14px';
    legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    legend.style.padding = '10px';
    legend.style.borderRadius = '5px';

    let legendHTML = '<div style="text-align: left; font-weight: bold;">Room Types:</div>';

    // Add each room type to the legend
    Object.entries(RoomType).forEach(([key, value]) => {
      const color = RoomColors[value];
      legendHTML += `
          <div style="display: flex; align-items: center; margin: 5px 0;">
              <div style="width: 20px; height: 20px; background-color: ${color}; margin-right: 10px; border: 1px solid #666;"></div>
              <span>${key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}</span>
          </div>`;
    });

    // Add corridor
    legendHTML += `
      <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; background-color: ${RoomColors.corridor}; margin-right: 10px; border: 1px solid #666;"></div>
          <span>Corridor</span>
      </div>`;

    // Add doors
    legendHTML += `
      <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; background-color: ${RoomColors.door.closed}; margin-right: 10px; border: 1px solid #666;"></div>
          <span>Door (Closed)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 5px 0;">
          <div style="width: 20px; height: 20px; background-color: ${RoomColors.door.open}; margin-right: 10px; border: 1px solid #666;"></div>
          <span>Door (Open)</span>
      </div>`;

    legend.innerHTML = legendHTML;
    document.getElementById('gameContainer').appendChild(legend);
  }

  generateNewDungeon() {
    /// Clear existing room type tracking
    this.roomTypes.clear();

    // Generate new dungeon layout
    const dungeon = this.dungeonGenerator.generate();

    // Store room types for each cell
    for (const room of dungeon.rooms) {
      for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
          this.roomTypes.set(`${x},${y}`, room.type);
        }
      }
    }

    // Store corridor locations
    for (const corridor of dungeon.corridors) {
      for (const point of corridor.path) {
        this.roomTypes.set(`${point.x},${point.y}`, 'corridor');
      }
    }

    // Clear existing grid
    this.gridManager.clear();

    // Apply dungeon to grid
    for (let y = 0; y < dungeon.grid.length; y++) {
      for (let x = 0; x < dungeon.grid[y].length; x++) {
        const cell = this.gridManager.getCell(x, y);
        switch (dungeon.grid[y][x]) {
          case 0: // Empty
            cell.setType('wall');
            cell.walkable = false;
            cell.transparent = false;
            break;
          case 1: // Floor
            cell.setType('floor');
            cell.walkable = true;
            cell.transparent = true;
            break;
          case 2: // Door
            cell.setType('door');
            cell.walkable = true;
            cell.transparent = false;
            break;
          case 3: // Wall
            cell.setType('wall');
            cell.walkable = false;
            cell.transparent = false;
            break;
        }
      }
    }

    // Place player in a valid position
    this.placePlayerInDungeon();

    // Reset camera to follow player
    this.camera.follow(this.playerPos.x, this.playerPos.y);

    // Update initial visibility
    this.updateVisibility();
  }

  placePlayerInDungeon() {
    // Find first walkable cell
    for (let y = 0; y < this.gridManager.height; y++) {
      for (let x = 0; x < this.gridManager.width; x++) {
        if (this.gridManager.canMoveTo(x, y)) {
          this.playerPos = { x, y };
          return;
        }
      }
    }
  }

  updateVisibility() {
    this.gridManager.resetVisibility();
    const visibleCells = this.gridManager.getCellsInRange(this.playerPos.x, this.playerPos.y, 5);
    for (const cell of visibleCells) {
      if (this.gridManager.hasLineOfSight(this.playerPos.x, this.playerPos.y, cell.x, cell.y)) {
        cell.visible = true;
        cell.explored = true;
      }
    }
  }

  addInstructions() {
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.top = '10px';
    instructions.style.left = '10px';
    instructions.style.color = 'white';
    instructions.style.fontFamily = 'monospace';
    instructions.style.fontSize = '14px';
    instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructions.style.padding = '10px';
    instructions.style.borderRadius = '5px';
    instructions.innerHTML = 'Arrow Keys: Move<br>E: Open/Close Door<br>Space: Generate New Dungeon';
    document.getElementById('gameContainer').appendChild(instructions);
  }

  handleKeyDown(event) {
    if (event.code === 'KeyE') {
      this.tryToggleDoorInFacingDirection();
      event.preventDefault();
      return;
    }

    let newX = this.playerPos.x;
    let newY = this.playerPos.y;
    let newFacingX = 0;
    let newFacingY = 0;

    // Determine facing direction based on key
    switch (event.code) {
      case 'ArrowUp':
        newY--;
        newFacingX = 0;
        newFacingY = -1;
        break;
      case 'ArrowDown':
        newY++;
        newFacingX = 0;
        newFacingY = 1;
        break;
      case 'ArrowLeft':
        newX--;
        newFacingX = -1;
        newFacingY = 0;
        break;
      case 'ArrowRight':
        newX++;
        newFacingX = 1;
        newFacingY = 0;
        break;
      default:
        return;
    }

    // Always update facing direction
    this.playerFacing.x = newFacingX;
    this.playerFacing.y = newFacingY;

    // Attempt movement if possible
    if (this.gridManager.canMoveTo(newX, newY)) {
      this.playerPos.x = newX;
      this.playerPos.y = newY;
      this.camera.follow(this.playerPos.x, this.playerPos.y);
      this.updateVisibility();
    }

    event.preventDefault();
  }

  tryToggleDoorInFacingDirection() {
    const facingX = this.playerPos.x + this.playerFacing.x;
    const facingY = this.playerPos.y + this.playerFacing.y;

    const facingCell = this.gridManager.getCell(facingX, facingY);
    if (facingCell && facingCell.isDoor) {
      if (facingCell.toggleDoor()) {
        this.updateVisibility();
        return true;
      }
    }
    return false;
  }


  renderGrid() {
    const { width, height, tileSize } = this.gridManager;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!this.camera.isVisible(x, y)) continue;

        const cell = this.gridManager.getCell(x, y);
        if (!cell.explored) continue;

        const screenPos = this.camera.worldToScreen(x, y);
        let fillColor = '#333';

        if (!cell.visible) {
          fillColor = '#1a1a1a';
        } else {
          const roomType = this.roomTypes.get(`${x},${y}`);
          switch (cell.type) {
            case 'wall':
              fillColor = RoomColors.wall;
              break;
            case 'door':
              fillColor = cell.isOpen ? RoomColors.door.open : RoomColors.door.closed;
              break;
            case 'floor':
              if (roomType === 'corridor') {
                fillColor = RoomColors.corridor;
              } else {
                fillColor = RoomColors[roomType] || RoomColors[RoomType.STANDARD];
              }
              break;
          }
        }

        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);

        if (cell.visible) {
          this.ctx.strokeStyle = '#222';
          this.ctx.strokeRect(screenPos.x, screenPos.y, tileSize, tileSize);
        }
      }
    }
  }

  renderPlayer() {
    const screenPos = this.camera.worldToScreen(this.playerPos.x, this.playerPos.y);
    const tileSize = this.gridManager.tileSize;

    // Draw player base
    this.ctx.fillStyle = '#ff0';
    this.ctx.fillRect(
      screenPos.x + 2,
      screenPos.y + 2,
      tileSize - 4,
      tileSize - 4
    );

    // Draw direction indicator
    this.ctx.fillStyle = '#f00';
    const indicatorSize = tileSize / 3;
    const centerX = screenPos.x + tileSize / 2;
    const centerY = screenPos.y + tileSize / 2;

    const indicatorX = centerX + (this.playerFacing.x * (tileSize / 4));
    const indicatorY = centerY + (this.playerFacing.y * (tileSize / 4));

    this.ctx.beginPath();
    this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  gameLoop(timestamp) {
    try {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.renderGrid();
      this.renderPlayer();

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px monospace';
      this.ctx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, 10, this.canvas.height - 20);
      this.ctx.fillText(`Pos: (${this.playerPos.x}, ${this.playerPos.y})`, 10, this.canvas.height - 8);

      this.frameCount++;
      requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      console.error('Game loop error:', error);
      throw error;
    }
  }
}

// Initialize game when the window loads
console.log('Game script loaded, waiting for window load');
window.addEventListener('load', () => {
  console.log('Window loaded, initializing game');
  try {
    window.game = new GameManager();
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
});

export default GameManager;
