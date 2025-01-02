// src/engine/GameEngine.js

import { World } from './ecs';
import { RenderSystem, AnimationSystem, MovementSystem, CollisionSystem, InputSystem } from './systems';
import { Camera } from './Camera';
import { EntityFactory } from '../game/entities/EntityFactory';
import { DungeonGenerator } from '../game/dungeon/DungeonGenerator';
import { AssetManager } from './AssetManager';
import { GridManager } from './grid/GridManager';

export class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Could not get 2D context');
    }

    // Initialize core components
    this.assetManager = new AssetManager();
    this.world = new World();
    this.camera = new Camera(
      this.canvas.width,
      this.canvas.height,
      50, // World width in tiles
      50, // World height in tiles
      32  // Tile size
    );

    // Initialize managers
    this.gridManager = new GridManager(50, 50, 32);
    this.dungeonGenerator = new DungeonGenerator(50, 50);
    this.entityFactory = new EntityFactory(this.world, this.assetManager);

    // Initialize game state
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;
    this.accumulator = 0;
    this.timeStep = 1 / this.targetFPS;

    // Initialize systems
    this.initializeSystems();

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
  }

  async initialize() {
    try {
      // Load assets
      await this.loadAssets();

      // Generate initial dungeon
      this.generateDungeon();

      // Create initial entities
      this.createInitialEntities();

      // Start game loop
      this.start();

      return true;
    } catch (error) {
      console.error('Failed to initialize game:', error);
      return false;
    }
  }

  initializeSystems() {
    // Add systems in priority order
    this.world.addSystem(new InputSystem(this.world));
    this.world.addSystem(new MovementSystem(this.world));
    this.world.addSystem(new CollisionSystem(this.world, this.gridManager));
    this.world.addSystem(new AnimationSystem(this.world));
    this.world.addSystem(new RenderSystem(this.world, this.ctx, this.camera));
  }

  async loadAssets() {
    // Define asset paths
    const assets = {
      player: '/assets/sprites/player.png',
      monsters: {
        goblin: '/assets/sprites/goblin.png',
        skeleton: '/assets/sprites/skeleton.png',
        orc: '/assets/sprites/orc.png',
        boss: '/assets/sprites/boss.png'
      },
      items: {
        potion: '/assets/sprites/potion.png',
        sword: '/assets/sprites/sword.png',
        shield: '/assets/sprites/shield.png',
        armor: '/assets/sprites/armor.png'
      },
      environment: {
        wall: '/assets/sprites/wall.png',
        floor: '/assets/sprites/floor.png',
        door: '/assets/sprites/door.png'
      },
      effects: {
        hit: '/assets/sprites/hit.png',
        magic: '/assets/sprites/magic.png'
      }
    };

    // Load all assets
    await this.assetManager.loadAssets(assets);
  }

  generateDungeon() {
    // Generate new dungeon layout
    const dungeon = this.dungeonGenerator.generate();

    // Clear existing grid
    this.gridManager.clear();

    // Apply dungeon to grid
    for (let y = 0; y < dungeon.grid.length; y++) {
      for (let x = 0; x < dungeon.grid[y].length; x++) {
        const cell = this.gridManager.getCell(x, y);
        if (cell) {
          switch (dungeon.grid[y][x]) {
            case 0: // Empty
              cell.setType('wall');
              break;
            case 1: // Floor
              cell.setType('floor');
              break;
            case 2: // Door
              cell.setType('door');
              break;
          }
        }
      }
    }

    return dungeon;
  }

  createInitialEntities() {
    // Create player
    const startRoom = this.dungeonGenerator.rooms.find(room => room.type === 'entrance');
    if (startRoom) {
      const player = this.entityFactory.createPlayer(
        startRoom.x + Math.floor(startRoom.width / 2),
        startRoom.y + Math.floor(startRoom.height / 2)
      );
      this.world.addEntity(player);
    }

    // Create monsters
    this.dungeonGenerator.rooms.forEach(room => {
      if (room.type === 'standard' || room.type === 'large_hall') {
        const numMonsters = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numMonsters; i++) {
          const x = room.x + Math.floor(Math.random() * (room.width - 2)) + 1;
          const y = room.y + Math.floor(Math.random() * (room.height - 2)) + 1;
          const monsterType = Math.random() < 0.7 ? 'goblin' : 'skeleton';
          const monster = this.entityFactory.createMonster(monsterType, x, y);
          this.world.addEntity(monster);
        }
      } else if (room.type === 'boss') {
        const x = room.x + Math.floor(room.width / 2);
        const y = room.y + Math.floor(room.height / 2);
        const boss = this.entityFactory.createMonster('boss', x, y);
        this.world.addEntity(boss);
      }
    });
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.accumulator = 0;
      requestAnimationFrame(this.gameLoop);
    }
  }

  stop() {
    this.isRunning = false;
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    // Calculate frame time
    const frameTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update accumulator
    this.accumulator += frameTime;

    // Update game state at fixed time steps
    while (this.accumulator >= this.frameInterval) {
      this.update(this.timeStep);
      this.accumulator -= this.frameInterval;
    }

    // Render
    this.render();

    // Schedule next frame
    requestAnimationFrame(this.gameLoop);
  }

  update(deltaTime) {
    // Update world (which updates all systems)
    this.world.update(deltaTime);

    // Update camera to follow player
    const player = this.world.findEntityByTag('player');
    if (player) {
      const transform = player.getComponent('TransformComponent');
      if (transform) {
        this.camera.follow(transform.x, transform.y);
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render world
    const renderSystem = this.world.getSystem('RenderSystem');
    if (renderSystem) {
      renderSystem.render(this.ctx);
    }
  }

  // Window resize handler
  handleResize() {
    // Update canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Update camera viewport
    this.camera.updateViewport(this.canvas.width, this.canvas.height);
  }

  // Save game state
  saveGame() {
    const saveData = {
      player: this.serializePlayer(),
      world: this.serializeWorld(),
      dungeon: this.serializeDungeon()
    };

    localStorage.setItem('gameState', JSON.stringify(saveData));
  }

  // Load game state
  loadGame() {
    const saveData = localStorage.getItem('gameState');
    if (saveData) {
      const data = JSON.parse(saveData);
      this.deserializeWorld(data.world);
      this.deserializeDungeon(data.dungeon);
      this.deserializePlayer(data.player);
    }
  }

  // Helper methods for serialization
  serializePlayer() {
    const player = this.world.findEntityByTag('player');
    if (!player) return null;

    return {
      // Add player-specific serialization logic
    };
  }

  serializeWorld() {
    return {
      // Add world serialization logic
    };
  }

  serializeDungeon() {
    return {
      // Add dungeon serialization logic
    };
  }

  deserializeWorld(data) {
    // Add world deserialization logic
  }

  deserializeDungeon(data) {
    // Add dungeon deserialization logic
  }

  deserializePlayer(data) {
    // Add player deserialization logic
  }
}
