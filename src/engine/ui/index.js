// src/engine/ui/index.js

export class UISystem {
  constructor(canvas, world) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.world = world;
    this.layers = new Map();
    this.activeMenus = new Set();
    this.focusedElement = null;
    this.isDragging = false;
    this.draggedItem = null;
    this.tooltipDelay = 500;
    this.tooltipTimer = null;
    this.mousePosition = { x: 0, y: 0 };

    // Initialize UI layers
    this.initializeLayers();

    // Bind event handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    // Add event listeners
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  initializeLayers() {
    // Create layers in rendering order
    this.addLayer('background', -10);
    this.addLayer('game', 0);
    this.addLayer('hud', 10);
    this.addLayer('menu', 20);
    this.addLayer('dialog', 30);
    this.addLayer('tooltip', 40);
    this.addLayer('notification', 50);
  }

  addLayer(name, zIndex) {
    this.layers.set(name, {
      name,
      zIndex,
      elements: new Set(),
      visible: true
    });
  }

  toggleMenu(menuName) {
    if (this.activeMenus.has(menuName)) {
      this.closeMenu(menuName);
    } else {
      this.openMenu(menuName);
    }
  }

  openMenu(menuName) {
    this.activeMenus.add(menuName);
    const menu = this.createMenu(menuName);
    if (menu) {
      this.addElement(menu, 'menu');
    }
  }

  closeMenu(menuName) {
    this.activeMenus.delete(menuName);
    this.layers.get('menu').elements.forEach(element => {
      if (element.name === menuName) {
        this.removeElement(element);
      }
    });
  }

  createMenu(menuName) {
    switch (menuName) {
      case 'inventory':
        return this.createInventoryMenu();
      case 'character':
        return this.createCharacterMenu();
      case 'map':
        return this.createMapMenu();
      case 'pause':
        return this.createPauseMenu();
      default:
        return null;
    }
  }

  createInventoryMenu() {
    const player = this.world.findEntityByTag('player');
    if (!player) return null;

    const inventory = player.getComponent('InventoryComponent');
    if (!inventory) return null;

    return {
      name: 'inventory',
      type: 'menu',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      visible: true,
      elements: [
        {
          type: 'panel',
          x: 0,
          y: 0,
          width: 400,
          height: 300,
          color: 'rgba(0, 0, 0, 0.8)'
        },
        {
          type: 'text',
          x: 20,
          y: 30,
          text: 'Inventory',
          font: '24px Arial',
          color: '#fff'
        },
        {
          type: 'grid',
          x: 20,
          y: 60,
          width: 360,
          height: 200,
          columns: 5,
          rows: 4,
          cellSize: 64,
          padding: 4,
          items: inventory.items.map((item, index) => ({
            type: 'item',
            item,
            index,
            draggable: true
          }))
        }
      ],
      onRender: (ctx) => {
        // Additional custom rendering if needed
      }
    };
  }

  createCharacterMenu() {
    const player = this.world.findEntityByTag('player');
    if (!player) return null;

    const stats = player.getComponent('StatsComponent');
    const progress = player.getComponent('ProgressComponent');

    return {
      name: 'character',
      type: 'menu',
      x: 150,
      y: 100,
      width: 400,
      height: 500,
      visible: true,
      elements: [
        {
          type: 'panel',
          x: 0,
          y: 0,
          width: 400,
          height: 500,
          color: 'rgba(0, 0, 0, 0.8)'
        },
        {
          type: 'text',
          x: 20,
          y: 30,
          text: 'Character',
          font: '24px Arial',
          color: '#fff'
        },
        {
          type: 'stats',
          x: 20,
          y: 60,
          width: 360,
          height: 400,
          stats: {
            level: progress.level,
            experience: progress.experience,
            nextLevel: progress.experienceToNext,
            physicality: stats.physicality,
            mental: stats.mental,
            social: stats.social,
            hp: stats.currentHP,
            maxHP: stats.maxHP
          }
        }
      ]
    };
  }

  createMapMenu() {
    return {
      name: 'map',
      type: 'menu',
      x: 100,
      y: 100,
      width: 500,
      height: 400,
      visible: true,
      elements: [
        {
          type: 'panel',
          x: 0,
          y: 0,
          width: 500,
          height: 400,
          color: 'rgba(0, 0, 0, 0.8)'
        },
        {
          type: 'minimap',
          x: 20,
          y: 20,
          width: 460,
          height: 360,
          scale: 0.5
        }
      ]
    };
  }

  addElement(element, layerName = 'game') {
    const layer = this.layers.get(layerName);
    if (layer) {
      layer.elements.add(element);
    }
  }

  removeElement(element) {
    for (const layer of this.layers.values()) {
      layer.elements.delete(element);
    }
  }

  update(deltaTime) {
    // Update all UI elements
    for (const layer of this.layers.values()) {
      if (!layer.visible) continue;

      for (const element of layer.elements) {
        if (element.update) {
          element.update(deltaTime);
        }
      }
    }

    // Update tooltips
    this.updateTooltips();
  }

  render(ctx) {
    // Sort layers by z-index
    const sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => a.zIndex - b.zIndex);

    // Render each layer
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      for (const element of layer.elements) {
        if (element.visible !== false) {
          this.renderElement(ctx, element);
        }
      }
    }

    // Render dragged item if any
    if (this.isDragging && this.draggedItem) {
      this.renderDraggedItem(ctx);
    }
  }

  renderElement(ctx, element) {
    switch (element.type) {
      case 'panel':
        this.renderPanel(ctx, element);
        break;
      case 'text':
        this.renderText(ctx, element);
        break;
      case 'button':
        this.renderButton(ctx, element);
        break;
      case 'grid':
        this.renderGrid(ctx, element);
        break;
      case 'stats':
        this.renderStats(ctx, element);
        break;
      case 'minimap':
        this.renderMinimap(ctx, element);
        break;
      default:
        if (element.onRender) {
          element.onRender(ctx);
        }
    }
  }

  renderPanel(ctx, panel) {
    ctx.fillStyle = panel.color || 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panel.x, panel.y, panel.width, panel.height);

    if (panel.border) {
      ctx.strokeStyle = panel.borderColor || '#fff';
      ctx.lineWidth = panel.borderWidth || 1;
      ctx.strokeRect(panel.x, panel.y, panel.width, panel.height);
    }
  }

  renderText(ctx, text) {
    ctx.font = text.font || '16px Arial';
    ctx.fillStyle = text.color || '#fff';
    ctx.textBaseline = text.baseline || 'top';
    ctx.fillText(text.text, text.x, text.y);
  }

  renderButton(ctx, button) {
    // Button background
    ctx.fillStyle = button.hovered ? button.hoverColor : button.color || '#444';
    ctx.fillRect(button.x, button.y, button.width, button.height);

    // Button text
    ctx.font = button.font || '16px Arial';
    ctx.fillStyle = button.textColor || '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }

  renderGrid(ctx, grid) {
    const { cellSize, padding } = grid;

    // Draw grid cells
    for (let i = 0; i < grid.items.length; i++) {
      const row = Math.floor(i / grid.columns);
      const col = i % grid.columns;
      const x = grid.x + col * (cellSize + padding);
      const y = grid.y + row * (cellSize + padding);

      // Draw cell background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(x, y, cellSize, cellSize);

      // Draw item if exists
      const item = grid.items[i];
      if (item && item !== this.draggedItem) {
        this.renderGridItem(ctx, item, x, y, cellSize);
      }
    }
  }

  renderGridItem(ctx, item, x, y, size) {
    if (item.item.sprite) {
      // Draw item sprite
      ctx.drawImage(item.item.sprite, x, y, size, size);
    } else {
      // Fallback to colored rectangle
      ctx.fillStyle = item.item.color || '#888';
      ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    }

    // Draw stack size if applicable
    if (item.item.stack > 1) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.fillText(item.item.stack.toString(), x + size - 4, y + size - 4);
    }
  }

  renderStats(ctx, stats) {
    const lineHeight = 30;
    let y = stats.y;

    // Draw level and experience
    ctx.font = '18px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Level: ${stats.stats.level}`, stats.x, y);
    y += lineHeight;

    // Experience bar
    const expWidth = stats.width - 40;
    const expProgress = stats.stats.experience / stats.stats.nextLevel;
    ctx.fillStyle = '#333';
    ctx.fillRect(stats.x, y, expWidth, 20);
    ctx.fillStyle = '#4a4';
    ctx.fillRect(stats.x, y, expWidth * expProgress, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(`XP: ${stats.stats.experience}/${stats.stats.nextLevel}`,
      stats.x + 10, y + 15);
    y += lineHeight + 10;

    // Draw attributes
    const attributes = [
      { name: 'Physicality', value: stats.stats.physicality },
      { name: 'Mental', value: stats.stats.mental },
      { name: 'Social', value: stats.stats.social }
    ];

    attributes.forEach(attr => {
      ctx.fillStyle = '#fff';
      ctx.fillText(`${attr.name}: ${attr.value}`, stats.x, y);
      y += lineHeight;
    });

    // HP bar
    const hpWidth = stats.width - 40;
    const hpProgress = stats.stats.hp / stats.stats.maxHP;
    ctx.fillStyle = '#333';
    ctx.fillRect(stats.x, y, hpWidth, 20);
    ctx.fillStyle = '#a44';
    ctx.fillRect(stats.x, y, hpWidth * hpProgress, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(`HP: ${stats.stats.hp}/${stats.stats.maxHP}`,
      stats.x + 10, y + 15);
  }

  renderMinimap(ctx, minimap) {
    // Get game world data
    const gridManager = this.world.gridManager;
    if (!gridManager) return;

    const cellSize = 4 * minimap.scale;

    // Draw explored areas
    for (let y = 0; y < gridManager.height; y++) {
      for (let x = 0; x < gridManager.width; x++) {
        const cell = gridManager.getCell(x, y);
        if (cell && cell.explored) {
          ctx.fillStyle = cell.walkable ? '#444' : '#222';
          ctx.fillRect(
            minimap.x + x * cellSize,
            minimap.y + y * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    // Draw player position
    const player = this.world.findEntityByTag('player');
    if (player) {
      const transform = player.getComponent('TransformComponent');
      if (transform) {
        ctx.fillStyle = '#ff0';
        ctx.fillRect(
          minimap.x + transform.x * cellSize - cellSize / 2,
          minimap.y + transform.y * cellSize - cellSize / 2,
          cellSize,
          cellSize
        );
      }
    }

    // Draw monsters and NPCs
    this.world.entities.forEach(entity => {
      if (entity.hasTag('monster') || entity.hasTag('npc')) {
        const transform = entity.getComponent('TransformComponent');
        if (transform) {
          const cell = gridManager.getCell(Math.floor(transform.x), Math.floor(transform.y));
          if (cell && cell.explored) {
            ctx.fillStyle = entity.hasTag('monster') ? '#f00' : '#0f0';
            ctx.fillRect(
              minimap.x + transform.x * cellSize - cellSize / 2,
              minimap.y + transform.y * cellSize - cellSize / 2,
              cellSize,
              cellSize
            );
          }
        }
      }
    });
  }

  renderDraggedItem(ctx) {
    if (!this.draggedItem || !this.mousePosition) return;

    const size = 64; // Standard item size
    const x = this.mousePosition.x - size / 2;
    const y = this.mousePosition.y - size / 2;

    // Draw semi-transparent version of the item
    ctx.globalAlpha = 0.7;
    this.renderGridItem(ctx, this.draggedItem, x, y, size);
    ctx.globalAlpha = 1.0;
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Update hover states
    this.updateHoverStates();

    // Update drag position if dragging
    if (this.isDragging) {
      this.updateDrag();
    }

    // Handle tooltips
    this.handleTooltipHover();
  }

  handleMouseDown(event) {
    const element = this.findElementAtPosition(this.mousePosition);

    if (element) {
      this.focusedElement = element;

      if (element.draggable) {
        this.startDrag(element);
      }

      if (element.onClick) {
        element.onClick(event);
      }
    } else {
      this.focusedElement = null;
    }
  }

  handleMouseUp(event) {
    if (this.isDragging) {
      this.endDrag();
    }

    const element = this.findElementAtPosition(this.mousePosition);
    if (element && element.onRelease) {
      element.onRelease(event);
    }
  }

  handleKeyDown(event) {
    // Handle menu hotkeys
    switch (event.code) {
      case 'KeyI':
        this.toggleMenu('inventory');
        break;
      case 'KeyC':
        this.toggleMenu('character');
        break;
      case 'KeyM':
        this.toggleMenu('map');
        break;
      case 'Escape':
        this.handleEscapeKey();
        break;
    }

    // Handle focused element key events
    if (this.focusedElement && this.focusedElement.onKeyDown) {
      this.focusedElement.onKeyDown(event);
    }
  }

  handleEscapeKey() {
    // Close menus in reverse order of their z-index
    const activeMenuArray = Array.from(this.activeMenus);
    if (activeMenuArray.length > 0) {
      const lastMenu = activeMenuArray[activeMenuArray.length - 1];
      this.closeMenu(lastMenu);
    }
  }

  startDrag(element) {
    this.isDragging = true;
    this.draggedItem = element;
    this.dragOrigin = { ...this.mousePosition };
  }

  updateDrag() {
    if (!this.isDragging || !this.draggedItem) return;

    // Calculate drag distance
    const dx = this.mousePosition.x - this.dragOrigin.x;
    const dy = this.mousePosition.y - this.dragOrigin.y;

    // Update dragged item position
    if (this.draggedItem.onDrag) {
      this.draggedItem.onDrag(dx, dy);
    }
  }

  endDrag() {
    if (!this.isDragging || !this.draggedItem) return;

    const dropTarget = this.findDropTarget(this.mousePosition);
    if (dropTarget && dropTarget.onDrop) {
      dropTarget.onDrop(this.draggedItem);
    }

    this.isDragging = false;
    this.draggedItem = null;
    this.dragOrigin = null;
  }

  updateHoverStates() {
    // Reset all hover states
    this.layers.forEach(layer => {
      layer.elements.forEach(element => {
        if (element.hovered) {
          element.hovered = false;
          if (element.onHoverEnd) {
            element.onHoverEnd();
          }
        }
      });
    });

    // Find and update hovered element
    const hoveredElement = this.findElementAtPosition(this.mousePosition);
    if (hoveredElement) {
      hoveredElement.hovered = true;
      if (hoveredElement.onHoverStart) {
        hoveredElement.onHoverStart();
      }
    }
  }

  handleTooltipHover() {
    clearTimeout(this.tooltipTimer);

    const hoveredElement = this.findElementAtPosition(this.mousePosition);
    if (hoveredElement && hoveredElement.tooltip) {
      this.tooltipTimer = setTimeout(() => {
        this.showTooltip(hoveredElement);
      }, this.tooltipDelay);
    } else {
      this.hideTooltip();
    }
  }

  showTooltip(element) {
    const tooltip = {
      type: 'tooltip',
      x: this.mousePosition.x + 10,
      y: this.mousePosition.y + 10,
      text: element.tooltip,
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 5
    };

    this.addElement(tooltip, 'tooltip');
  }

  hideTooltip() {
    const tooltipLayer = this.layers.get('tooltip');
    if (tooltipLayer) {
      tooltipLayer.elements.clear();
    }
  }

  findElementAtPosition(position) {
    // Search elements in reverse z-index order (top to bottom)
    const sortedLayers = Array.from(this.layers.values())
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      for (const element of layer.elements) {
        if (this.isPositionOverElement(position, element)) {
          return element;
        }
      }
    }

    return null;
  }

  findDropTarget(position) {
    return this.findElementAtPosition(position);
  }

  isPositionOverElement(position, element) {
    return position.x >= element.x &&
      position.x <= element.x + element.width &&
      position.y >= element.y &&
      position.y <= element.y + element.height;
  }

  cleanup() {
    // Remove event listeners
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('keydown', this.handleKeyDown);

    // Clear all layers
    this.layers.forEach(layer => layer.elements.clear());
    this.layers.clear();

    // Reset state
    this.activeMenus.clear();
    this.focusedElement = null;
    this.isDragging = false;
    this.draggedItem = null;
    clearTimeout(this.tooltipTimer);
  }
}
