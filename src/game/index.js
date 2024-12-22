// src/game/index.js
import { GridManager } from './grid/GridManager.js';

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

      // Set canvas size to match grid
      const GRID_WIDTH = 20;
      const GRID_HEIGHT = 15;
      const TILE_SIZE = 32;

      this.canvas.width = GRID_WIDTH * TILE_SIZE;
      this.canvas.height = GRID_HEIGHT * TILE_SIZE;

      // Initial canvas setup
      this.ctx.imageSmoothingEnabled = false;

      // Create grid system
      this.gridManager = new GridManager(GRID_WIDTH, GRID_HEIGHT, TILE_SIZE);

      // Set up game state
      this.lastFrameTime = 0;
      this.frameCount = 0;

      // Create test dungeon
      this.createTestDungeon();

      // Player position
      this.playerPos = { x: 2, y: 2 };

      // Bind event handlers
      this.handleKeyDown = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.handleKeyDown);

      // Start game loop
      console.log('Starting game loop...');
      this.gameLoop(0);

      // Hide loading screen
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    } catch (error) {
      console.error('Game initialization error:', error);
      throw error;
    }
  }

  createTestDungeon() {
    // Create some test walls
    for (let x = 5; x < 10; x++) {
      this.gridManager.getCell(x, 5).setType('wall');
    }

    for (let y = 5; y < 8; y++) {
      this.gridManager.getCell(10, y).setType('wall');
    }

    // Add a test door
    const doorCell = this.gridManager.getCell(7, 5);
    doorCell.setType('door');
    doorCell.setProperty('locked', true);
    doorCell.setProperty('key_id', 'test_key');
  }

  handleKeyDown(event) {
    let newX = this.playerPos.x;
    let newY = this.playerPos.y;

    switch (event.code) {
      case 'ArrowUp':
        newY--;
        break;
      case 'ArrowDown':
        newY++;
        break;
      case 'ArrowLeft':
        newX--;
        break;
      case 'ArrowRight':
        newX++;
        break;
    }

    // Check if the new position is walkable
    if (this.gridManager.canMoveTo(newX, newY)) {
      this.playerPos.x = newX;
      this.playerPos.y = newY;
    }

    // Calculate visibility from new position
    this.gridManager.resetVisibility();
    const visibleCells = this.gridManager.getCellsInRange(this.playerPos.x, this.playerPos.y, 5);
    for (const cell of visibleCells) {
      if (this.gridManager.hasLineOfSight(this.playerPos.x, this.playerPos.y, cell.x, cell.y)) {
        cell.visible = true;
        cell.explored = true;
      }
    }
  }

  renderGrid() {
    const { width, height, tileSize } = this.gridManager;

    // Draw each cell
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = this.gridManager.getCell(x, y);
        const { x: screenX, y: screenY } = this.gridManager.gridToScreen(x, y);

        if (!cell.explored) {
          continue; // Don't render unexplored cells
        }

        // Determine cell color based on type and visibility
        let fillColor = '#333'; // Default floor color
        if (!cell.visible) {
          fillColor = '#1a1a1a'; // Darker for explored but not visible
        }

        switch (cell.type) {
          case 'wall':
            fillColor = cell.visible ? '#666' : '#333';
            break;
          case 'door':
            fillColor = cell.visible ? '#8b4513' : '#3b2613'; // Brown for doors
            break;
        }

        // Draw cell
        this.ctx.fillStyle = fillColor;
        this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Draw grid lines
        this.ctx.strokeStyle = '#444';
        this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);
      }
    }
  }

  renderPlayer() {
    const { x: screenX, y: screenY } = this.gridManager.gridToScreen(this.playerPos.x, this.playerPos.y);
    const tileSize = this.gridManager.tileSize;

    // Draw player (yellow square)
    this.ctx.fillStyle = '#ff0';
    this.ctx.fillRect(
      screenX + 4,
      screenY + 4,
      tileSize - 8,
      tileSize - 8
    );
  }

  gameLoop(timestamp) {
    try {
      // Calculate delta time
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Clear canvas
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Render game elements
      this.renderGrid();
      this.renderPlayer();

      // Draw FPS counter
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '14px monospace';
      this.ctx.fillText(`FPS: ${Math.round(1000 / deltaTime)}`, 10, 20);

      this.frameCount++;
      requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      console.error('Game loop error:', error);
      throw error;
    }
  }
}

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
