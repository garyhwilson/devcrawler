// src/game/systems/SaveSystem.js

export class SaveSystem {
  constructor(world) {
    this.world = world;
    this.autoSaveInterval = 5 * 60 * 1000; // 5 minutes
    this.lastAutoSave = Date.now();
    this.maxSaveSlots = 10;
    this.currentSaveSlot = 'save_1';
  }

  async saveGame(slot = this.currentSaveSlot) {
    try {
      const saveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        player: this.serializePlayer(),
        world: this.serializeWorld(),
        dungeon: this.serializeDungeon(),
        entities: this.serializeEntities(),
        metadata: {
          playtime: this.world.playtime,
          difficulty: this.world.difficulty,
          level: this.world.currentLevel
        }
      };

      // Save to localStorage
      localStorage.setItem(slot, JSON.stringify(saveData));

      // Update save metadata
      this.updateSaveMetadata(slot, saveData);

      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  async loadGame(slot = this.currentSaveSlot) {
    try {
      const saveData = localStorage.getItem(slot);
      if (!saveData) {
        throw new Error('No save data found');
      }

      const data = JSON.parse(saveData);

      // Verify save version compatibility
      if (!this.isVersionCompatible(data.version)) {
        throw new Error('Incompatible save version');
      }

      // Clear current world state
      this.world.clear();

      // Load world state
      await this.deserializeWorld(data.world);
      await this.deserializeDungeon(data.dungeon);
      await this.deserializeEntities(data.entities);
      await this.deserializePlayer(data.player);

      // Restore metadata
      this.world.playtime = data.metadata.playtime;
      this.world.difficulty = data.metadata.difficulty;
      this.world.currentLevel = data.metadata.level;

      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  }

  serializePlayer() {
    const player = this.world.findEntityByTag('player');
    if (!player) return null;

    return {
      transform: this.serializeComponent(player.getComponent('TransformComponent')),
      stats: this.serializeComponent(player.getComponent('StatsComponent')),
      inventory: this.serializeComponent(player.getComponent('InventoryComponent')),
      combat: this.serializeComponent(player.getComponent('CombatComponent')),
      progress: this.serializeComponent(player.getComponent('ProgressComponent')),
      skills: this.serializeComponent(player.getComponent('SkillComponent')),
      status: this.serializeComponent(player.getComponent('StatusEffectComponent')),
      quests: this.serializeComponent(player.getComponent('QuestComponent'))
    };
  }

  serializeWorld() {
    return {
      grid: this.serializeGrid(),
      time: Date.now(),
      score: this.world.score,
      discoveredAreas: Array.from(this.world.discoveredAreas),
      activeQuests: Array.from(this.world.activeQuests),
      globalState: { ...this.world.globalState }
    };
  }

  serializeDungeon() {
    return {
      rooms: this.world.dungeonGenerator.rooms.map(room => ({
        x: room.x,
        y: room.y,
        width: room.width,
        height: room.height,
        type: room.type,
        features: Array.from(room.features.entries()),
        isLocked: room.isLocked,
        requiredKey: room.requiredKey
      })),
      corridors: this.world.dungeonGenerator.corridors.map(corridor => ({
        startX: corridor.startX,
        startY: corridor.startY,
        endX: corridor.endX,
        endY: corridor.endY,
        path: corridor.path
      }))
    };
  }

  serializeEntities() {
    return this.world.entities
      .filter(entity => !entity.hasTag('player')) // Player is saved separately
      .map(entity => ({
        id: entity.id,
        tags: Array.from(entity.tags),
        components: this.serializeEntityComponents(entity)
      }));
  }

  serializeEntityComponents(entity) {
    const components = {};
    entity.components.forEach((component, name) => {
      components[name] = this.serializeComponent(component);
    });
    return components;
  }

  serializeComponent(component) {
    if (!component) return null;

    // Handle special component serialization
    switch (component.constructor.name) {
      case 'InventoryComponent':
        return {
          ...component,
          items: component.items.map(item => this.serializeItem(item))
        };
      case 'StatusEffectComponent':
        return {
          ...component,
          effects: Array.from(component.effects.entries())
        };
      case 'QuestComponent':
        return {
          ...component,
          quests: Array.from(component.quests.entries()),
          activeQuests: Array.from(component.activeQuests),
          completedQuests: Array.from(component.completedQuests)
        };
      default:
        return { ...component };
    }
  }

  serializeItem(item) {
    return {
      id: item.id,
      type: item.type,
      name: item.name,
      properties: { ...item.properties },
      stats: { ...item.stats },
      effects: item.effects?.map(effect => ({ ...effect }))
    };
  }

  serializeGrid() {
    const grid = [];
    for (let y = 0; y < this.world.gridManager.height; y++) {
      const row = [];
      for (let x = 0; x < this.world.gridManager.width; x++) {
        const cell = this.world.gridManager.getCell(x, y);
        row.push({
          type: cell.type,
          walkable: cell.walkable,
          transparent: cell.transparent,
          explored: cell.explored,
          properties: Array.from(cell.properties.entries())
        });
      }
      grid.push(row);
    }
    return grid;
  }

  async deserializeWorld(data) {
    this.world.score = data.score;
    this.world.discoveredAreas = new Set(data.discoveredAreas);
    this.world.activeQuests = new Set(data.activeQuests);
    this.world.globalState = { ...data.globalState };

    // Restore grid
    this.deserializeGrid(data.grid);
  }

  async deserializeDungeon(data) {
    // Clear existing dungeon
    this.world.dungeonGenerator.rooms = [];
    this.world.dungeonGenerator.corridors = [];

    // Restore rooms
    data.rooms.forEach(roomData => {
      const room = new Room(roomData.x, roomData.y, roomData.width, roomData.height);
      room.type = roomData.type;
      room.isLocked = roomData.isLocked;
      room.requiredKey = roomData.requiredKey;
      roomData.features.forEach(([key, value]) => room.features.set(key, value));
      this.world.dungeonGenerator.rooms.push(room);
    });

    // Restore corridors
    data.corridors.forEach(corridorData => {
      const corridor = new Corridor(
        corridorData.startX,
        corridorData.startY,
        corridorData.endX,
        corridorData.endY
      );
      corridor.path = corridorData.path;
      this.world.dungeonGenerator.corridors.push(corridor);
    });
  }

  async deserializeEntities(data) {
    for (const entityData of data) {
      const entity = new Entity();
      entity.id = entityData.id;
      entityData.tags.forEach(tag => entity.addTag(tag));

      // Restore components
      for (const [name, componentData] of Object.entries(entityData.components)) {
        const component = this.deserializeComponent(name, componentData);
        if (component) {
          entity.addComponent(component);
        }
      }

      this.world.addEntity(entity);
    }
  }

  async deserializePlayer(data) {
    if (!data) return;

    const player = new Entity().addTag('player');

    // Restore player components
    for (const [name, componentData] of Object.entries(data)) {
      if (componentData) {
        const component = this.deserializeComponent(name, componentData);
        if (component) {
          player.addComponent(component);
        }
      }
    }

    this.world.addEntity(player);
  }

  deserializeComponent(name, data) {
    if (!data) return null;

    // Create appropriate component based on name
    switch (name) {
      case 'TransformComponent':
        return new TransformComponent(data.x, data.y, data.rotation);
      case 'StatsComponent':
        return new StatsComponent(data);
      case 'InventoryComponent':
        const inventory = new InventoryComponent(data.size);
        inventory.items = data.items.map(itemData => this.deserializeItem(itemData));
        return inventory;
      case 'CombatComponent':
        return new CombatComponent(data);
      case 'ProgressComponent':
        return new ProgressComponent(data);
      case 'SkillComponent':
        const skills = new SkillComponent();
        data.skills.forEach(skill => skills.addSkill(skill.name, skill.level));
        return skills;
      case 'StatusEffectComponent':
        const status = new StatusEffectComponent();
        data.effects.forEach(([id, effect]) => status.addEffect(effect));
        return status;
      case 'QuestComponent':
        const quests = new QuestComponent();
        data.quests.forEach(([id, quest]) => quests.addQuest(quest));
        quests.activeQuests = new Set(data.activeQuests);
        quests.completedQuests = new Set(data.completedQuests);
        return quests;
      default:
        console.warn(`Unknown component type: ${name}`);
        return null;
    }
  }

  deserializeItem(data) {
    const item = new Item(data.type, data.name);
    item.id = data.id;
    item.properties = { ...data.properties };
    item.stats = { ...data.stats };
    item.effects = data.effects?.map(effect => ({ ...effect }));
    return item;
  }

  deserializeGrid(gridData) {
    for (let y = 0; y < gridData.length; y++) {
      for (let x = 0; x < gridData[y].length; x++) {
        const cellData = gridData[y][x];
        const cell = this.world.gridManager.getCell(x, y);

        cell.type = cellData.type;
        cell.walkable = cellData.walkable;
        cell.transparent = cellData.transparent;
        cell.explored = cellData.explored;
        cellData.properties.forEach(([key, value]) =>
          cell.properties.set(key, value)
        );
      }
    }
  }

  getSaveMetadata() {
    const metadata = [];
    for (let i = 1; i <= this.maxSaveSlots; i++) {
      const slot = `save_${i}`;
      const data = localStorage.getItem(slot);
      if (data) {
        try {
          const saveData = JSON.parse(data);
          metadata.push({
            slot,
            timestamp: saveData.timestamp,
            playerLevel: saveData.player?.progress?.level || 1,
            playtime: saveData.metadata.playtime,
            area: saveData.metadata.level
          });
        } catch (error) {
          console.warn(`Failed to parse save metadata for slot ${slot}:`, error);
        }
      }
    }
    return metadata.sort((a, b) => b.timestamp - a.timestamp);
  }

  updateSaveMetadata(slot, saveData) {
    const metadata = this.getSaveMetadata();
    const existingIndex = metadata.findIndex(m => m.slot === slot);

    if (existingIndex !== -1) {
      metadata[existingIndex] = {
        slot,
        timestamp: saveData.timestamp,
        playerLevel: saveData.player?.progress?.level || 1,
        playtime: saveData.metadata.playtime,
        area: saveData.metadata.level
      };
    } else {
      metadata.push({
        slot,
        timestamp: saveData.timestamp,
        playerLevel: saveData.player?.progress?.level || 1,
        playtime: saveData.metadata.playtime,
        area: saveData.metadata.level
      });
    }

    localStorage.setItem('save_metadata', JSON.stringify(metadata));
  }

  deleteSave(slot) {
    localStorage.removeItem(slot);
    const metadata = this.getSaveMetadata();
    const updatedMetadata = metadata.filter(m => m.slot !== slot);
    localStorage.setItem('save_metadata', JSON.stringify(updatedMetadata));
  }

  isVersionCompatible(saveVersion) {
    const currentVersion = '1.0.0';
    const [saveMajor, saveMinor] = saveVersion.split('.').map(Number);
    const [currentMajor, currentMinor] = currentVersion.split('.').map(Number);

    // Major version must match, minor version must be less than or equal
    return saveMajor === currentMajor && saveMinor <= currentMinor;
  }

  checkAutoSave() {
    const currentTime = Date.now();
    if (currentTime - this.lastAutoSave >= this.autoSaveInterval) {
      this.saveGame('autosave');
      this.lastAutoSave = currentTime;
    }
  }

  cleanup() {
    // Optional: clean up any temporary save data
  }
}
