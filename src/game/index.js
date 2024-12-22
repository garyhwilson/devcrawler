// src/game/index.js

import { GridManager } from './grid/GridManager.js';
import { DungeonGenerator } from './dungeon/DungeonGenerator.js';
import { Camera } from './Camera.js';

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

      // Set up game state
      this.lastFrameTime = 0;
      this.frameCount = 0;

      // Player position - will be set after dungeon generation
      this.playerPos = { x: 0, y: 0 };

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

  generateNewDungeon() {
    // Generate new dungeon layout
    const dungeon = this.dungeonGenerator.generate();

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
      this.tryToggleNearbyDoor();
      event.preventDefault();
      return;
    }

    let newX = this.playerPos.x;
    let newY = this.playerPos.y;

    switch (event.code) {
      case 'ArrowUp': newY--; break;
      case 'ArrowDown': newY++; break;
      case 'ArrowLeft': newX--; break;
      case 'ArrowRight': newX++; break;
      default: return;
    }

    if (this.gridManager.canMoveTo(newX, newY)) {
      this.playerPos.x = newX;
      this.playerPos.y = newY;
      this.camera.follow(this.playerPos.x, this.playerPos.y);
      this.updateVisibility();
    }

    event.preventDefault();
  }

  tryToggleNearbyDoor() {
    const neighbors = this.gridManager.getNeighbors(
      this.playerPos.x,
      this.playerPos.y,
      true // include diagonals
    );

    for (const cell of neighbors) {
      if (cell.isDoor) {
        if (cell.toggleDoor()) {
          this.updateVisibility();
          return true;
        }
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
          switch (cell.type) {
            case 'wall':
              fillColor = '#666';
              break;
            case 'door':
              fillColor = cell.isOpen ? '#4a2' : '#8b4513';
              break;
            case 'floor':
              fillColor = '#444';
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
    this.ctx.fillStyle = '#ff0';
    this.ctx.fillRect(
      screenPos.x + 2,
      screenPos.y + 2,
      tileSize - 4,
      tileSize - 4
    );
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
