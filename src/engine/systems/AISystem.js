//src/game/systems/AISystem.js

import { System } from '../../engine/ecs';

export class AISystem extends System {
  constructor(world) {
    super(world);
    this.priority = 60;

    // AI Update intervals to prevent processing every frame
    this.updateInterval = 250; // milliseconds
    this.lastUpdate = 0;

    // Pathfinding cache
    this.pathCache = new Map();
    this.pathCacheTimeout = 1000; // milliseconds

    // Behavior states
    this.behaviorStates = new Map();
  }

  update(deltaTime) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate < this.updateInterval) {
      return;
    }
    this.lastUpdate = currentTime;

    // Clear expired path cache entries
    this.cleanPathCache();

    // Get all entities with AI components
    const aiEntities = this.world.queryEntities('AIComponent', 'TransformComponent');

    for (const entity of aiEntities) {
      this.updateEntityAI(entity, deltaTime);
    }
  }

  updateEntityAI(entity, deltaTime) {
    const ai = entity.getComponent('AIComponent');
    const transform = entity.getComponent('TransformComponent');
    const combat = entity.getComponent('CombatComponent');

    // Skip if stunned or disabled
    if (this.isDisabled(entity)) return;

    // Get current behavior state or initialize new one
    let state = this.behaviorStates.get(entity.id);
    if (!state) {
      state = this.initializeBehaviorState(entity);
      this.behaviorStates.set(entity.id, state);
    }

    // Update behavior state
    switch (state.behavior) {
      case 'idle':
        this.updateIdleBehavior(entity, state);
        break;
      case 'patrol':
        this.updatePatrolBehavior(entity, state);
        break;
      case 'chase':
        this.updateChaseBehavior(entity, state);
        break;
      case 'attack':
        this.updateAttackBehavior(entity, state);
        break;
      case 'flee':
        this.updateFleeBehavior(entity, state);
        break;
      case 'return':
        this.updateReturnBehavior(entity, state);
        break;
    }

    // Update patrol timer if applicable
    if (state.patrolTimer > 0) {
      state.patrolTimer -= deltaTime;
    }
  }

  initializeBehaviorState(entity) {
    const ai = entity.getComponent('AIComponent');
    const transform = entity.getComponent('TransformComponent');

    return {
      behavior: 'idle',
      lastPosition: { x: transform.x, y: transform.y },
      homePosition: { x: transform.x, y: transform.y },
      target: null,
      path: [],
      patrolPoints: ai.patrolPoints || [],
      currentPatrolIndex: 0,
      patrolTimer: 0,
      lastAttackTime: 0,
      searchRadius: ai.searchRadius || 8,
      fleeThreshold: ai.fleeThreshold || 0.3
    };
  }

  updateIdleBehavior(entity, state) {
    // Check for nearby players
    const target = this.findNearestTarget(entity, state.searchRadius);

    if (target) {
      // Switch to chase behavior if target found
      state.target = target;
      state.behavior = 'chase';
      return;
    }

    // Switch to patrol if patrol points exist and timer expired
    if (state.patrolPoints.length > 0 && state.patrolTimer <= 0) {
      state.behavior = 'patrol';
      state.currentPatrolIndex = 0;
      state.patrolTimer = 0;
    }
  }

  updatePatrolBehavior(entity, state) {
    const transform = entity.getComponent('TransformComponent');

    // Check for nearby players first
    const target = this.findNearestTarget(entity, state.searchRadius);
    if (target) {
      state.target = target;
      state.behavior = 'chase';
      return;
    }

    // Continue patrol
    const currentPatrolPoint = state.patrolPoints[state.currentPatrolIndex];

    // If we've reached the current patrol point
    if (this.isAtPosition(transform, currentPatrolPoint)) {
      state.currentPatrolIndex = (state.currentPatrolIndex + 1) % state.patrolPoints.length;
      state.patrolTimer = 1000; // Wait 1 second at each point
      return;
    }

    // Move towards patrol point
    const path = this.findPath(transform, currentPatrolPoint);
    if (path && path.length > 0) {
      this.moveAlongPath(entity, path);
    }
  }

  updateChaseBehavior(entity, state) {
    const transform = entity.getComponent('TransformComponent');
    const combat = entity.getComponent('CombatComponent');

    // Verify target still exists and is valid
    if (!this.isValidTarget(state.target)) {
      state.target = null;
      state.behavior = 'return';
      return;
    }

    const targetTransform = state.target.getComponent('TransformComponent');
    const distance = this.getDistance(transform, targetTransform);

    // Check if we should flee
    if (this.shouldFlee(entity)) {
      state.behavior = 'flee';
      return;
    }

    // If in attack range
    if (distance <= (combat?.attackRange || 1)) {
      state.behavior = 'attack';
      return;
    }

    // Move towards target
    const path = this.findPath(transform, targetTransform);
    if (path && path.length > 0) {
      this.moveAlongPath(entity, path);
    }
  }

  updateAttackBehavior(entity, state) {
    const transform = entity.getComponent('TransformComponent');
    const combat = entity.getComponent('CombatComponent');

    // Verify target still exists and is valid
    if (!this.isValidTarget(state.target)) {
      state.target = null;
      state.behavior = 'return';
      return;
    }

    const targetTransform = state.target.getComponent('TransformComponent');
    const distance = this.getDistance(transform, targetTransform);

    // Check if we should flee
    if (this.shouldFlee(entity)) {
      state.behavior = 'flee';
      return;
    }

    // If target moved out of range, switch back to chase
    if (distance > (combat?.attackRange || 1)) {
      state.behavior = 'chase';
      return;
    }

    // Attack if cooldown is ready
    const currentTime = Date.now();
    if (currentTime - state.lastAttackTime >= (combat?.attackCooldown || 1000)) {
      this.performAttack(entity, state.target);
      state.lastAttackTime = currentTime;
    }
  }

  updateFleeBehavior(entity, state) {
    const transform = entity.getComponent('TransformComponent');

    // If health improved or target lost, return home
    if (!this.shouldFlee(entity) || !this.isValidTarget(state.target)) {
      state.behavior = 'return';
      return;
    }

    // Find fleeing destination (away from target)
    const fleePosition = this.findFleePosition(entity, state.target);
    if (fleePosition) {
      const path = this.findPath(transform, fleePosition);
      if (path && path.length > 0) {
        this.moveAlongPath(entity, path);
      }
    }
  }

  updateReturnBehavior(entity, state) {
    const transform = entity.getComponent('TransformComponent');

    // Check if we're back home
    if (this.isAtPosition(transform, state.homePosition)) {
      state.behavior = 'idle';
      return;
    }

    // Move towards home position
    const path = this.findPath(transform, state.homePosition);
    if (path && path.length > 0) {
      this.moveAlongPath(entity, path);
    }
  }

  findPath(fromTransform, toPosition) {
    // Check cache first
    const cacheKey = `${fromTransform.x},${fromTransform.y}-${toPosition.x},${toPosition.y}`;
    const cachedPath = this.pathCache.get(cacheKey);
    if (cachedPath && cachedPath.timestamp > Date.now() - this.pathCacheTimeout) {
      return cachedPath.path;
    }

    // A* pathfinding implementation
    const path = this.aStarPathfinding(
      { x: Math.floor(fromTransform.x), y: Math.floor(fromTransform.y) },
      { x: Math.floor(toPosition.x), y: Math.floor(toPosition.y) }
    );

    // Cache the result
    this.pathCache.set(cacheKey, {
      path,
      timestamp: Date.now()
    });

    return path;
  }

  aStarPathfinding(start, goal) {
    const gridManager = this.world.gridManager;
    if (!gridManager) return [];

    const openSet = new Set([JSON.stringify(start)]);
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(JSON.stringify(start), 0);
    fScore.set(JSON.stringify(start), this.heuristic(start, goal));

    while (openSet.size > 0) {
      // Find node with lowest fScore
      let current = null;
      let lowestF = Infinity;
      for (const pos of openSet) {
        const f = fScore.get(pos);
        if (f < lowestF) {
          lowestF = f;
          current = JSON.parse(pos);
        }
      }

      if (current.x === goal.x && current.y === goal.y) {
        return this.reconstructPath(cameFrom, current);
      }

      openSet.delete(JSON.stringify(current));

      // Check neighbors
      const neighbors = this.getValidNeighbors(current, gridManager);
      for (const neighbor of neighbors) {
        const neighborPos = JSON.stringify(neighbor);
        const tentativeG = gScore.get(JSON.stringify(current)) + 1;

        if (!gScore.has(neighborPos) || tentativeG < gScore.get(neighborPos)) {
          cameFrom.set(neighborPos, current);
          gScore.set(neighborPos, tentativeG);
          fScore.set(neighborPos, tentativeG + this.heuristic(neighbor, goal));
          openSet.add(neighborPos);
        }
      }
    }

    return []; // No path found
  }

  getValidNeighbors(pos, gridManager) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ];

    for (const dir of directions) {
      const newPos = {
        x: pos.x + dir.x,
        y: pos.y + dir.y
      };

      if (gridManager.isInBounds(newPos.x, newPos.y)) {
        const cell = gridManager.getCell(newPos.x, newPos.y);
        if (cell && cell.walkable) {
          neighbors.push(newPos);
        }
      }
    }

    return neighbors;
  }

  heuristic(pos, goal) {
    // Manhattan distance
    return Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentStr = JSON.stringify(current);

    while (cameFrom.has(currentStr)) {
      current = cameFrom.get(currentStr);
      currentStr = JSON.stringify(current);
      path.unshift(current);
    }

    return path;
  }

  moveAlongPath(entity, path) {
    if (path.length < 2) return;

    const transform = entity.getComponent('TransformComponent');
    const velocity = entity.getComponent('VelocityComponent');
    if (!velocity) return;

    // Get next waypoint
    const nextWaypoint = path[1];

    // Calculate direction to next waypoint
    const dx = nextWaypoint.x - transform.x;
    const dy = nextWaypoint.y - transform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Set velocity
    const speed = 4; // Tiles per second
    if (distance > 0) {
      velocity.vx = (dx / distance) * speed;
      velocity.vy = (dy / distance) * speed;
    }
  }

  findNearestTarget(entity, searchRadius) {
    const transform = entity.getComponent('TransformComponent');
    const ai = entity.getComponent('AIComponent');
    let nearestTarget = null;
    let nearestDistance = searchRadius;

    // Search for valid targets (usually players)
    const potentialTargets = this.world.queryEntities('PlayerComponent');
    for (const target of potentialTargets) {
      const targetTransform = target.getComponent('TransformComponent');
      const distance = this.getDistance(transform, targetTransform);

      if (distance < nearestDistance && this.hasLineOfSight(transform, targetTransform)) {
        nearestTarget = target;
        nearestDistance = distance;
      }
    }

    return nearestTarget;
  }

  findFleePosition(entity, target) {
    const transform = entity.getComponent('TransformComponent');
    const targetTransform = target.getComponent('TransformComponent');

    // Calculate direction away from target
    const dx = transform.x - targetTransform.x;
    const dy = transform.y - targetTransform.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return null;

    // Normalize and scale to flee distance
    const fleeDistance = 5; // 5 tiles away
    const fleeX = transform.x + (dx / distance) * fleeDistance;
    const fleeY = transform.y + (dy / distance) * fleeDistance;

    // Ensure position is within bounds and walkable
    const gridManager = this.world.gridManager;
    const x = Math.floor(Math.max(0, Math.min(fleeX, gridManager.width - 1)));
    const y = Math.floor(Math.max(0, Math.min(fleeY, gridManager.height - 1)));

    return { x, y };
  }

  performAttack(entity, target) {
    const combat = entity.getComponent('CombatComponent');
    if (!combat) return;

    // Queue attack in combat system
    const combatSystem = this.world.getSystem('CombatSystem');
    if (combatSystem) {
      combatSystem.queueAttack(entity, target);
    }
  }

  shouldFlee(entity) {
    const combat = entity.getComponent('CombatComponent');
    const ai = entity.getComponent('AIComponent');

    if (!combat || !ai) return false;

    // Check if health is below flee threshold
    const healthPercentage = combat.currentHP / combat.maxHP;
    return healthPercentage <= ai.fleeThreshold;
  }

  isValidTarget(target) {
    if (!target || !this.world.entities.includes(target)) return false;

    const combat = target.getComponent('CombatComponent');
    return combat && combat.currentHP > 0;
  }

  isDisabled(entity) {
    const statusComponent = entity.getComponent('StatusEffectComponent');
    if (!statusComponent) return false;

    // Check for disabling effects like stun, freeze, etc.
    return statusComponent.hasEffect('stunned') ||
      statusComponent.hasEffect('frozen') ||
      statusComponent.hasEffect('paralyzed');
  }

  hasLineOfSight(fromTransform, toTransform) {
    const gridManager = this.world.gridManager;
    if (!gridManager) return false;

    return gridManager.hasLineOfSight(
      Math.floor(fromTransform.x),
      Math.floor(fromTransform.y),
      Math.floor(toTransform.x),
      Math.floor(toTransform.y)
    );
  }

  getDistance(transformA, transformB) {
    const dx = transformA.x - transformB.x;
    const dy = transformA.y - transformB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  isAtPosition(transform, position, threshold = 0.1) {
    const dx = transform.x - position.x;
    const dy = transform.y - position.y;
    return Math.abs(dx) < threshold && Math.abs(dy) < threshold;
  }

  cleanPathCache() {
    const currentTime = Date.now();
    for (const [key, value] of this.pathCache.entries()) {
      if (currentTime - value.timestamp > this.pathCacheTimeout) {
        this.pathCache.delete(key);
      }
    }
  }

  cleanup() {
    this.pathCache.clear();
    this.behaviorStates.clear();
  }
}

// AI Component Definition
export class AIComponent {
  constructor(config = {}) {
    this.type = config.type || 'basic'; // basic, aggressive, defensive, etc.
    this.searchRadius = config.searchRadius || 8;
    this.fleeThreshold = config.fleeThreshold || 0.3;
    this.attackRange = config.attackRange || 1;
    this.patrolPoints = config.patrolPoints || [];
    this.aggressionLevel = config.aggressionLevel || 0.5; // 0 to 1
    this.intelligence = config.intelligence || 0.5; // 0 to 1

    // Behavior weights
    this.weights = {
      aggression: config.weights?.aggression || 1.0,
      selfPreservation: config.weights?.selfPreservation || 1.0,
      teamwork: config.weights?.teamwork || 0.5,
      territoriality: config.weights?.territoriality || 0.7
    };

    // Custom behavior functions
    this.customBehaviors = new Map();
    if (config.customBehaviors) {
      Object.entries(config.customBehaviors).forEach(([key, behavior]) => {
        this.addCustomBehavior(key, behavior);
      });
    }
  }

  addCustomBehavior(name, behaviorFn) {
    this.customBehaviors.set(name, behaviorFn);
  }

  executeCustomBehavior(name, entity) {
    const behavior = this.customBehaviors.get(name);
    if (behavior) {
      return behavior(entity);
    }
    return false;
  }
}

// AI Factory for creating different types of AI behaviors
export class AIFactory {
  static createBasicMonster() {
    return new AIComponent({
      type: 'basic',
      searchRadius: 6,
      fleeThreshold: 0.2,
      aggressionLevel: 0.6,
      weights: {
        aggression: 0.7,
        selfPreservation: 0.8,
        teamwork: 0.3,
        territoriality: 0.5
      }
    });
  }

  static createAggressiveMonster() {
    return new AIComponent({
      type: 'aggressive',
      searchRadius: 8,
      fleeThreshold: 0.1,
      aggressionLevel: 0.9,
      weights: {
        aggression: 1.0,
        selfPreservation: 0.3,
        teamwork: 0.4,
        territoriality: 0.8
      }
    });
  }

  static createDefensiveMonster() {
    return new AIComponent({
      type: 'defensive',
      searchRadius: 5,
      fleeThreshold: 0.4,
      aggressionLevel: 0.3,
      weights: {
        aggression: 0.4,
        selfPreservation: 1.0,
        teamwork: 0.7,
        territoriality: 0.9
      }
    });
  }

  static createBossMonster() {
    return new AIComponent({
      type: 'boss',
      searchRadius: 12,
      fleeThreshold: 0.15,
      aggressionLevel: 0.8,
      intelligence: 0.9,
      weights: {
        aggression: 0.9,
        selfPreservation: 0.7,
        teamwork: 1.0,
        territoriality: 1.0
      },
      customBehaviors: {
        specialAttack: (entity) => {
          // Implement boss-specific special attack behavior
          const combat = entity.getComponent('CombatComponent');
          if (combat && combat.currentHP < combat.maxHP * 0.5) {
            // Trigger special attack when below 50% HP
            return true;
          }
          return false;
        },
        summonMinions: (entity) => {
          // Implement minion summoning behavior
          const combat = entity.getComponent('CombatComponent');
          if (combat && combat.currentHP < combat.maxHP * 0.3) {
            // Summon minions when below 30% HP
            return true;
          }
          return false;
        }
      }
    });
  }

  static createPatrollingMonster(patrolPoints) {
    return new AIComponent({
      type: 'patrol',
      searchRadius: 7,
      fleeThreshold: 0.3,
      aggressionLevel: 0.5,
      patrolPoints: patrolPoints,
      weights: {
        aggression: 0.6,
        selfPreservation: 0.7,
        teamwork: 0.5,
        territoriality: 1.0
      }
    });
  }
}
