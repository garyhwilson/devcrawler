// src/game/systems/CombatSystem.js

import { Entity, System } from '../ecs'

export class CombatSystem extends System {
  constructor(world) {
    super(world)
    this.priority = 50
    this.attackQueue = []
    this.pendingEffects = []
    this.combatLog = []
    this.maxCombatLogEntries = 50
  }

  update(deltaTime) {
    // Process any queued attacks
    while (this.attackQueue.length > 0) {
      const attack = this.attackQueue.shift()
      this.processAttack(attack.attacker, attack.target, attack.type)
    }

    // Update all combat-related status effects
    this.updateStatusEffects(deltaTime)

    // Process pending effects (visual effects, damage numbers, etc.)
    this.processPendingEffects()
  }

  queueAttack(attacker, target, type = 'physical') {
    this.attackQueue.push({ attacker, target, type })
  }

  processAttack(attacker, target, attackType = 'physical') {
    const attackerCombat = attacker.getComponent('CombatComponent')
    const attackerStats = attacker.getComponent('StatsComponent')
    const targetCombat = target.getComponent('CombatComponent')
    const targetStats = target.getComponent('StatsComponent')

    if (!attackerCombat || !targetCombat || !attackerStats || !targetStats) {
      return
    }

    // Calculate attack roll
    const attackRoll = this.calculateAttackRoll(attacker, target, attackType)
    const targetAC = this.calculateTargetAC(target)

    // Check if attack hits
    if (attackRoll >= targetAC) {
      // Calculate and apply damage
      const damage = this.calculateDamage(attacker, target, attackType)
      this.applyDamage(target, damage, attackType)

      // Create hit effect
      this.createHitEffect(target, damage)

      // Log the attack
      this.logCombatAction({
        type: 'hit',
        attacker: attacker.name || 'Attacker',
        target: target.name || 'Target',
        damage: damage,
        attackType
      })

      // Check for additional effects
      this.processAdditionalEffects(attacker, target, attackType)
    } else {
      // Attack missed
      this.createMissEffect(target)

      this.logCombatAction({
        type: 'miss',
        attacker: attacker.name || 'Attacker',
        target: target.name || 'Target',
        attackType
      })
    }

    // Trigger attack cooldown
    this.startAttackCooldown(attacker)
  }

  calculateAttackRoll(attacker, target, attackType) {
    const stats = attacker.getComponent('StatsComponent')
    const combat = attacker.getComponent('CombatComponent')

    // Base roll (d20)
    let roll = Math.floor(Math.random() * 20) + 1

    // Critical hit on natural 20
    if (roll === 20) return Infinity

    // Add modifiers based on attack type
    if (attackType === 'physical') {
      roll += Math.floor(stats.physicality / 3)
    } else if (attackType === 'magical') {
      roll += Math.floor(stats.mental / 3)
    }

    // Add weapon bonus if applicable
    const weapon = this.getEquippedWeapon(attacker)
    if (weapon) {
      roll += weapon.attackBonus || 0
    }

    // Add any status effect modifiers
    roll += this.getStatusEffectModifier(attacker, 'attackBonus')

    return roll
  }

  calculateTargetAC(target) {
    const stats = target.getComponent('StatsComponent')
    const combat = target.getComponent('CombatComponent')

    // Base AC
    let ac = combat.baseAC || 10

    // Add armor bonus
    const armor = this.getEquippedArmor(target)
    if (armor) {
      ac += armor.armorBonus || 0
    }

    // Add shield bonus
    const shield = this.getEquippedShield(target)
    if (shield) {
      ac += shield.armorBonus || 0
    }

    // Add physicality modifier
    ac += Math.floor(stats.physicality / 4)

    // Add any status effect modifiers
    ac += this.getStatusEffectModifier(target, 'armorClass')

    return ac
  }

  calculateDamage(attacker, target, attackType) {
    const stats = attacker.getComponent('StatsComponent')
    const combat = attacker.getComponent('CombatComponent')

    // Base damage
    let damage = combat.baseDamage || 1

    // Add weapon damage if applicable
    const weapon = this.getEquippedWeapon(attacker)
    if (weapon) {
      damage += this.rollWeaponDamage(weapon)
    }

    // Add attribute modifier
    if (attackType === 'physical') {
      damage += Math.floor(stats.physicality / 3)
    } else if (attackType === 'magical') {
      damage += Math.floor(stats.mental / 3)
    }

    // Add any status effect modifiers
    damage += this.getStatusEffectModifier(attacker, 'damageBonus')

    // Apply damage reduction from target
    damage = this.applyDamageReduction(damage, target)

    return Math.max(1, Math.floor(damage)) // Minimum 1 damage
  }

  rollWeaponDamage(weapon) {
    const diceCount = weapon.damageRoll?.count || 1
    const diceSides = weapon.damageRoll?.sides || 4
    let damage = 0

    for (let i = 0; i < diceCount; i++) {
      damage += Math.floor(Math.random() * diceSides) + 1
    }

    return damage + (weapon.damageBonus || 0)
  }

  applyDamageReduction(damage, target) {
    const stats = target.getComponent('StatsComponent')
    const combat = target.getComponent('CombatComponent')

    // Damage reduction from armor
    const armor = this.getEquippedArmor(target)
    if (armor) {
      damage -= armor.damageReduction || 0
    }

    // Damage reduction from effects
    damage -= this.getStatusEffectModifier(target, 'damageReduction')

    return Math.max(0, damage)
  }

  applyDamage(target, damage, type) {
    const combat = target.getComponent('CombatComponent')
    const previousHP = combat.currentHP

    combat.currentHP = Math.max(0, combat.currentHP - damage)

    // Check for death
    if (combat.currentHP === 0) {
      this.handleEntityDeath(target)
    }

    // Trigger damage events
    this.world.emit('entityDamaged', {
      entity: target,
      damage,
      type,
      previousHP,
      currentHP: combat.currentHP
    })
  }

  handleEntityDeath(entity) {
    // Create death effect
    this.createDeathEffect(entity)

    // Drop loot if applicable
    const loot = entity.getComponent('LootComponent')
    if (loot) {
      loot.dropLoot()
    }

    // Award experience if it's a monster
    if (entity.hasTag('monster')) {
      const progress = entity.getComponent('ProgressComponent')
      if (progress) {
        const player = this.world.findEntityByTag('player')
        if (player) {
          const playerProgress = player.getComponent('ProgressComponent')
          if (playerProgress) {
            playerProgress.addExperience(progress.experienceValue)
          }
        }
      }
    }

    // Trigger death event
    this.world.emit('entityDied', { entity })

    // Remove entity from world
    this.world.removeEntity(entity)
  }

  processAdditionalEffects(attacker, target, attackType) {
    // Process weapon effects
    const weapon = this.getEquippedWeapon(attacker)
    if (weapon && weapon.effects) {
      weapon.effects.forEach(effect => {
        if (Math.random() < effect.chance) {
          this.applyStatusEffect(target, effect)
        }
      })
    }

    // Process attacker's status effects that trigger on hit
    const attackerStatus = attacker.getComponent('StatusEffectComponent')
    if (attackerStatus) {
      attackerStatus.effects.forEach(effect => {
        if (effect.triggersOnHit && Math.random() < effect.chance) {
          this.applyStatusEffect(target, effect)
        }
      })
    }
  }

  applyStatusEffect(target, effect) {
    const statusComponent = target.getComponent('StatusEffectComponent')
    if (!statusComponent) return

    // Create a new instance of the effect
    const newEffect = {
      ...effect,
      duration: effect.duration,
      timeRemaining: effect.duration,
      strength: effect.strength
    }

    statusComponent.addEffect(newEffect)

    // Create visual effect
    this.createStatusEffect(target, effect.type)

    // Log effect application
    this.logCombatAction({
      type: 'effect',
      target: target.name || 'Target',
      effect: effect.name
    })
  }

  updateStatusEffects(deltaTime) {
    this.world.entities.forEach(entity => {
      const statusComponent = entity.getComponent('StatusEffectComponent')
      if (!statusComponent) return

      statusComponent.update(deltaTime)
    })
  }

  getStatusEffectModifier(entity, modifierType) {
    const statusComponent = entity.getComponent('StatusEffectComponent')
    if (!statusComponent) return 0

    let totalModifier = 0
    statusComponent.effects.forEach(effect => {
      if (effect.modifiers && effect.modifiers[modifierType]) {
        totalModifier += effect.modifiers[modifierType]
      }
    })

    return totalModifier
  }

  createHitEffect(target, damage) {
    const transform = target.getComponent('TransformComponent')
    if (!transform) return

    this.pendingEffects.push({
      type: 'hit',
      x: transform.x,
      y: transform.y,
      damage,
      timeToLive: 1.0
    })
  }

  createMissEffect(target) {
    const transform = target.getComponent('TransformComponent')
    if (!transform) return

    this.pendingEffects.push({
      type: 'miss',
      x: transform.x,
      y: transform.y,
      timeToLive: 0.5
    })
  }

  createDeathEffect(entity) {
    const transform = entity.getComponent('TransformComponent')
    if (!transform) return

    this.pendingEffects.push({
      type: 'death',
      x: transform.x,
      y: transform.y,
      timeToLive: 1.5
    })
  }

  createStatusEffect(target, effectType) {
    const transform = target.getComponent('TransformComponent')
    if (!transform) return

    this.pendingEffects.push({
      type: 'status',
      effectType,
      x: transform.x,
      y: transform.y,
      timeToLive: 0.75
    })
  }

  processPendingEffects() {
    // Update and remove expired effects
    this.pendingEffects = this.pendingEffects.filter(effect => {
      effect.timeToLive -= this.world.deltaTime
      return effect.timeToLive > 0
    })
  }

  logCombatAction(action) {
    this.combatLog.push({
      ...action,
      timestamp: Date.now()
    })

    // Trim log if it exceeds maximum size
    if (this.combatLog.length > this.maxCombatLogEntries) {
      this.combatLog.shift()
    }

    // Emit combat log event for UI updates
    this.world.emit('combatLogUpdated', { action })
  }

  getEquippedWeapon(entity) {
    const inventory = entity.getComponent('InventoryComponent')
    return inventory ? inventory.getEquippedItem('weapon') : null
  }

  getEquippedArmor(entity) {
    const inventory = entity.getComponent('InventoryComponent')
    return inventory ? inventory.getEquippedItem('armor') : null
  }

  getEquippedShield(entity) {
    const inventory = entity.getComponent('InventoryComponent')
    return inventory ? inventory.getEquippedItem('shield') : null
  }

  startAttackCooldown(entity) {
    const combat = entity.getComponent('CombatComponent')
    if (combat) {
      combat.lastAttackTime = Date.now()
    }
  }

  canAttack(entity) {
    const combat = entity.getComponent('CombatComponent')
    if (!combat) return false

    const now = Date.now()
    const timeSinceLastAttack = now - (combat.lastAttackTime || 0)
    return timeSinceLastAttack >= (combat.attackCooldown || 1000)
  }

  cleanup() {
    this.attackQueue = []
    this.pendingEffects = []
    this.combatLog = []
  }
}
