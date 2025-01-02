// src/engine/systems/InputSystem.js

import { System, VelocityComponent, TransformComponent, StateMachineComponent } from '../ecs';

export class InputSystem extends System {
  constructor(world) {
    super(world);
    this.addRequirement(TransformComponent)
      .addRequirement(VelocityComponent);

    this.priority = 95; // Run before most other systems

    // Track key states
    this.keys = new Set();
    this.keyMap = {
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'KeyE': 'action',
      'Space': 'attack',
      'KeyI': 'inventory',
      'KeyM': 'map',
      'KeyC': 'character',
      'Escape': 'menu',
      'KeyZ': 'interact',
      'KeyQ': 'quickUse1',
      'KeyW': 'quickUse2',
      'KeyR': 'quickUse3',
      'Tab': 'cycleTarget'
    };

    // Track mouse state
    this.mousePosition = { x: 0, y: 0 };
    this.mouseButtons = new Set();

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleWheel = this.handleWheel.bind(this);

    // Add event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
    window.addEventListener('wheel', this.handleWheel);

    // Game state
    this.targetableEntities = new Set();
    this.currentTarget = null;
  }

  cleanup() {
    // Remove event listeners when system is destroyed
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('wheel', this.handleWheel);
  }

  handleKeyDown(event) {
    const key = this.keyMap[event.code];
    if (key) {
      this.keys.add(key);
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    const key = this.keyMap[event.code];
    if (key) {
      this.keys.delete(key);
      event.preventDefault();
    }
  }

  handleMouseMove(event) {
    const rect = event.target.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  handleMouseDown(event) {
    this.mouseButtons.add(event.button);
    event.preventDefault();
  }

  handleMouseUp(event) {
    this.mouseButtons.delete(event.button);
    event.preventDefault();
  }

  handleWheel(event) {
    // Handle zoom levels
    if (event.deltaY < 0) {
      this.world.camera.zoomIn();
    } else {
      this.world.camera.zoomOut();
    }
    event.preventDefault();
  }

  update(deltaTime) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    this.handleMovement(player, deltaTime);
    this.handleActions(player);
    this.handleCombat(player);
    this.handleMenus(player);
    this.updateTargeting(player);
  }

  handleMovement(player, deltaTime) {
    const velocity = player.getComponent(VelocityComponent);
    const stateMachine = player.getComponent(StateMachineComponent);

    // Reset velocity
    velocity.vx = 0;
    velocity.vy = 0;

    // Movement speed (tiles per second)
    const speed = 4;

    // Handle movement
    if (this.keys.has('up')) {
      velocity.vy = -speed;
    }
    if (this.keys.has('down')) {
      velocity.vy = speed;
    }
    if (this.keys.has('left')) {
      velocity.vx = -speed;
    }
    if (this.keys.has('right')) {
      velocity.vx = speed;
    }

    // Normalize diagonal movement
    if (velocity.vx !== 0 && velocity.vy !== 0) {
      const normalize = 1 / Math.sqrt(2);
      velocity.vx *= normalize;
      velocity.vy *= normalize;
    }

    // Update player state based on movement
    if (stateMachine) {
      if (velocity.vx !== 0 || velocity.vy !== 0) {
        stateMachine.setState('walking');
      } else {
        stateMachine.setState('idle');
      }
    }
  }

  handleActions(player) {
    // Handle action key (interact with objects, doors, etc.)
    if (this.keys.has('action')) {
      this.handleInteraction(player);
      this.keys.delete('action'); // Consume the action
    }

    // Handle quick-use items
    if (this.keys.has('quickUse1')) {
      this.useQuickItem(player, 0);
      this.keys.delete('quickUse1');
    }
    if (this.keys.has('quickUse2')) {
      this.useQuickItem(player, 1);
      this.keys.delete('quickUse2');
    }
    if (this.keys.has('quickUse3')) {
      this.useQuickItem(player, 2);
      this.keys.delete('quickUse3');
    }
  }

  handleCombat(player) {
    if (this.keys.has('attack')) {
      this.handleAttack(player);
      this.keys.delete('attack');
    }

    // Handle target cycling
    if (this.keys.has('cycleTarget')) {
      this.cycleTarget();
      this.keys.delete('cycleTarget');
    }
  }

  handleMenus(player) {
    // Handle inventory toggle
    if (this.keys.has('inventory')) {
      this.toggleMenu('inventory');
      this.keys.delete('inventory');
    }

    // Handle map toggle
    if (this.keys.has('map')) {
      this.toggleMenu('map');
      this.keys.delete('map');
    }

    // Handle character sheet toggle
    if (this.keys.has('character')) {
      this.toggleMenu('character');
      this.keys.delete('character');
    }

    // Handle game menu
    if (this.keys.has('menu')) {
      this.toggleMenu('menu');
      this.keys.delete('menu');
    }
  }

  handleInteraction(player) {
    const transform = player.getComponent(TransformComponent);
    const facing = this.getFacingDirection(player);
    const interactX = Math.floor(transform.x + facing.x);
    const interactY = Math.floor(transform.y + facing.y);

    // Find interactable entities at the target position
    const interactables = this.world.entities.filter(entity => {
      if (!entity.hasTag('interactable')) return false;
      const entityTransform = entity.getComponent(TransformComponent);
      return entityTransform &&
        Math.floor(entityTransform.x) === interactX &&
        Math.floor(entityTransform.y) === interactY;
    });

    // Interact with the first found entity
    if (interactables.length > 0) {
      this.interact(player, interactables[0]);
    }
  }

  getFacingDirection(player) {
    const velocity = player.getComponent(VelocityComponent);
    if (velocity.vx === 0 && velocity.vy === 0) {
      // Use last known direction or default to down
      return player.lastFacing || { x: 0, y: 1 };
    }

    // Store the current facing direction
    player.lastFacing = {
      x: Math.sign(velocity.vx),
      y: Math.sign(velocity.vy)
    };
    return player.lastFacing;
  }

  handleAttack(player) {
    const combat = player.getComponent('CombatComponent');
    if (!combat) return;

    // If we have a current target, attack it
    if (this.currentTarget) {
      this.processAttack(player, this.currentTarget);
    } else {
      // Otherwise, attack in facing direction
      const transform = player.getComponent(TransformComponent);
      const facing = this.getFacingDirection(player);
      const attackArea = this.getAttackArea(transform, facing, combat.attackRange);

      // Find valid targets in attack area
      const targets = this.world.entities.filter(entity => {
        if (!entity.hasTag('monster')) return false;
        const targetTransform = entity.getComponent(TransformComponent);
        return targetTransform && this.isInArea(targetTransform, attackArea);
      });

      // Attack the closest target
      if (targets.length > 0) {
        const closest = this.findClosestEntity(transform, targets);
        this.processAttack(player, closest);
      }
    }
  }

  processAttack(attacker, target) {
    const combat = attacker.getComponent('CombatComponent');
    if (!combat) return;

    const stateMachine = attacker.getComponent(StateMachineComponent);
    if (stateMachine) {
      stateMachine.setState('attacking');
    }

    // Actual attack processing is handled by the CombatSystem
    const combatSystem = this.world.getSystem('CombatSystem');
    if (combatSystem) {
      combatSystem.processAttack(attacker, target);
    }
  }

  updateTargeting(player) {
    // Update list of targetable entities
    this.targetableEntities = new Set(
      this.world.entities.filter(entity =>
        entity.hasTag('monster') &&
        this.isInRange(player, entity, 10) // 10 tiles targeting range
      )
    );

    // Remove current target if it's no longer valid
    if (this.currentTarget && !this.targetableEntities.has(this.currentTarget)) {
      this.currentTarget = null;
    }
  }

  cycleTarget() {
    if (this.targetableEntities.size === 0) {
      this.currentTarget = null;
      return;
    }

    const targets = Array.from(this.targetableEntities);
    if (!this.currentTarget) {
      this.currentTarget = targets[0];
      return;
    }

    const currentIndex = targets.indexOf(this.currentTarget);
    const nextIndex = (currentIndex + 1) % targets.length;
    this.currentTarget = targets[nextIndex];
  }

  useQuickItem(player, slot) {
    const inventory = player.getComponent('InventoryComponent');
    if (!inventory) return;

    const quickItems = inventory.quickItems || [];
    const item = quickItems[slot];
    if (item) {
      item.use(player);
    }
  }

  toggleMenu(menuName) {
    const ui = this.world.findEntityByTag('ui');
    if (ui) {
      const uiComponent = ui.getComponent('UIComponent');
      if (uiComponent) {
        uiComponent.toggleMenu(menuName);
      }
    }
  }

  isInRange(entityA, entityB, range) {
    const transformA = entityA.getComponent(TransformComponent);
    const transformB = entityB.getComponent(TransformComponent);
    if (!transformA || !transformB) return false;

    const dx = transformA.x - transformB.x;
    const dy = transformA.y - transformB.y;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  findClosestEntity(transform, entities) {
    let closest = null;
    let minDistance = Infinity;

    entities.forEach(entity => {
      const entityTransform = entity.getComponent(TransformComponent);
      const dx = transform.x - entityTransform.x;
      const dy = transform.y - entityTransform.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closest = entity;
      }
    });

    return closest;
  }

  getAttackArea(transform, facing, range) {
    return {
      minX: transform.x + facing.x * range - 0.5,
      maxX: transform.x + facing.x * range + 0.5,
      minY: transform.y + facing.y * range - 0.5,
      maxY: transform.y + facing.y * range + 0.5
    };
  }

  isInArea(transform, area) {
    return transform.x >= area.minX && transform.x <= area.maxX &&
      transform.y >= area.minY && transform.y <= area.maxY;
  }
}
