// src/game/systems/ReputationSystem.js

export const FactionStanding = {
  HATED: -1000,
  HOSTILE: -500,
  UNFRIENDLY: -100,
  NEUTRAL: 0,
  FRIENDLY: 100,
  HONORED: 500,
  EXALTED: 1000
}

export class ReputationSystem {
  constructor(world) {
    this.world = world
    this.factions = new Map()
    this.relationships = new Map()
    this.reputationThresholds = new Map()
    this.reputationEffects = new Map()
  }

  registerFaction(factionId, config) {
    this.factions.set(factionId, {
      id: factionId,
      name: config.name,
      description: config.description,
      baseStanding: config.baseStanding || FactionStanding.NEUTRAL,
      enemies: new Set(config.enemies || []),
      allies: new Set(config.allies || []),
      hidden: config.hidden || false,
      perks: config.perks || new Map(),
      specialUnlocks: config.specialUnlocks || new Map()
    })

    // Initialize reputation thresholds
    this.reputationThresholds.set(factionId, new Map([
      [FactionStanding.HATED, config.thresholds?.hated || FactionStanding.HATED],
      [FactionStanding.HOSTILE, config.thresholds?.hostile || FactionStanding.HOSTILE],
      [FactionStanding.UNFRIENDLY, config.thresholds?.unfriendly || FactionStanding.UNFRIENDLY],
      [FactionStanding.NEUTRAL, FactionStanding.NEUTRAL],
      [FactionStanding.FRIENDLY, config.thresholds?.friendly || FactionStanding.FRIENDLY],
      [FactionStanding.HONORED, config.thresholds?.honored || FactionStanding.HONORED],
      [FactionStanding.EXALTED, config.thresholds?.exalted || FactionStanding.EXALTED]
    ]))
  }

  initializePlayerReputation() {
    const player = this.world.findEntityByTag('player')
    if (!player) return

    const reputationComponent = player.getComponent('ReputationComponent')
    if (!reputationComponent) return

    // Initialize standings for all factions
    this.factions.forEach((faction, factionId) => {
      if (!reputationComponent.hasStanding(factionId)) {
        reputationComponent.setStanding(factionId, faction.baseStanding)
      }
    })
  }

  adjustReputation(player, factionId, amount) {
    const faction = this.factions.get(factionId)
    if (!faction) return

    const reputationComponent = player.getComponent('ReputationComponent')
    if (!reputationComponent) return

    const oldStanding = reputationComponent.getStanding(factionId)
    const newStanding = this.calculateNewStanding(oldStanding, amount)

    // Apply the reputation change
    reputationComponent.setStanding(factionId, newStanding)

    // Adjust related faction standings
    this.adjustRelatedFactionStandings(player, factionId, amount)

    // Check for standing level changes
    const oldLevel = this.getStandingLevel(oldStanding)
    const newLevel = this.getStandingLevel(newStanding)

    if (oldLevel !== newLevel) {
      this.handleStandingLevelChange(player, factionId, oldLevel, newLevel)
    }

    // Emit reputation change event
    this.world.emit('reputationChanged', {
      factionId,
      oldStanding,
      newStanding,
      oldLevel,
      newLevel
    })
  }

  calculateNewStanding(currentStanding, adjustment) {
    // Apply diminishing returns for large reputation gains/losses
    const diminishedAdjustment = this.applyDiminishingReturns(adjustment)
    return Math.max(FactionStanding.HATED,
      Math.min(FactionStanding.EXALTED,
        currentStanding + diminishedAdjustment))
  }

  applyDiminishingReturns(amount) {
    const absAmount = Math.abs(amount)
    const sign = Math.sign(amount)

    if (absAmount <= 10) return amount

    // Logarithmic diminishing returns
    return sign * (10 + Math.log10(absAmount - 9) * 10)
  }

  adjustRelatedFactionStandings(player, factionId, amount) {
    const faction = this.factions.get(factionId)
    if (!faction) return

    // Adjust enemy faction standings (inverse effect)
    faction.enemies.forEach(enemyId => {
      const enemyFaction = this.factions.get(enemyId)
      if (enemyFaction) {
        this.adjustReputation(player, enemyId, -amount * 0.5)
      }
    })

    // Adjust ally faction standings (reduced effect)
    faction.allies.forEach(allyId => {
      const allyFaction = this.factions.get(allyId)
      if (allyFaction) {
        this.adjustReputation(player, allyId, amount * 0.25)
      }
    })
  }

  getStandingLevel(standing) {
    if (standing <= FactionStanding.HATED) return 'HATED'
    if (standing <= FactionStanding.HOSTILE) return 'HOSTILE'
    if (standing <= FactionStanding.UNFRIENDLY) return 'UNFRIENDLY'
    if (standing < FactionStanding.FRIENDLY) return 'NEUTRAL'
    if (standing < FactionStanding.HONORED) return 'FRIENDLY'
    if (standing < FactionStanding.EXALTED) return 'HONORED'
    return 'EXALTED'
  }

  handleStandingLevelChange(player, factionId, oldLevel, newLevel) {
    const faction = this.factions.get(factionId)
    if (!faction) return

    // Check for unlocked perks
    const unlockedPerks = this.checkUnlockedPerks(faction, newLevel)
    const lockedPerks = this.checkLockedPerks(faction, oldLevel)

    // Apply perk changes
    unlockedPerks.forEach(perk => this.applyPerk(player, perk, true))
    lockedPerks.forEach(perk => this.applyPerk(player, perk, false))

    // Check for special unlocks
    const unlocks = this.checkSpecialUnlocks(faction, newLevel)
    unlocks.forEach(unlock => this.handleUnlock(player, unlock))

    // Notify the player
    this.notifyStandingChange(player, faction, oldLevel, newLevel)
  }

  checkUnlockedPerks(faction, newLevel) {
    const unlockedPerks = []
    faction.perks.forEach((requiredLevel, perk) => {
      if (this.getStandingValue(newLevel) >= this.getStandingValue(requiredLevel)) {
        unlockedPerks.push(perk)
      }
    })
    return unlockedPerks
  }

  checkLockedPerks(faction, oldLevel) {
    const lockedPerks = []
    faction.perks.forEach((requiredLevel, perk) => {
      if (this.getStandingValue(oldLevel) >= this.getStandingValue(requiredLevel)) {
        lockedPerks.push(perk)
      }
    })
    return lockedPerks
  }

  getStandingValue(level) {
    return FactionStanding[level] || 0
  }

  applyPerk(player, perk, isUnlocking) {
    switch (perk.type) {
      case 'DISCOUNT':
        this.applyDiscountPerk(player, perk, isUnlocking)
        break
      case 'INVENTORY_ACCESS':
        this.applyInventoryAccessPerk(player, perk, isUnlocking)
        break
      case 'SKILL_BONUS':
        this.applySkillBonusPerk(player, perk, isUnlocking)
        break
      case 'QUEST_ACCESS':
        this.applyQuestAccessPerk(player, perk, isUnlocking)
        break
      case 'AREA_ACCESS':
        this.applyAreaAccessPerk(player, perk, isUnlocking)
        break
    }
  }

  applyDiscountPerk(player, perk, isUnlocking) {
    const inventory = player.getComponent('InventoryComponent')
    if (inventory) {
      inventory.factionDiscounts = inventory.factionDiscounts || new Map()
      if (isUnlocking) {
        inventory.factionDiscounts.set(perk.factionId, perk.amount)
      } else {
        inventory.factionDiscounts.delete(perk.factionId)
      }
    }
  }

  applyInventoryAccessPerk(player, perk, isUnlocking) {
    const progress = player.getComponent('ProgressComponent')
    if (progress) {
      if (isUnlocking) {
        progress.unlockedInventories.add(perk.inventoryId)
      } else {
        progress.unlockedInventories.delete(perk.inventoryId)
      }
    }
  }

  applySkillBonusPerk(player, perk, isUnlocking) {
    const skills = player.getComponent('SkillComponent')
    if (skills) {
      if (isUnlocking) {
        skills.addBonus(perk.skillId, perk.amount)
      } else {
        skills.removeBonus(perk.skillId, perk.amount)
      }
    }
  }

  applyQuestAccessPerk(player, perk, isUnlocking) {
    const quests = player.getComponent('QuestComponent')
    if (quests) {
      if (isUnlocking) {
        quests.unlockedQuestLines.add(perk.questLineId)
      } else {
        quests.unlockedQuestLines.delete(perk.questLineId)
      }
    }
  }

  applyAreaAccessPerk(player, perk, isUnlocking) {
    const progress = player.getComponent('ProgressComponent')
    if (progress) {
      if (isUnlocking) {
        progress.unlockedAreas.add(perk.areaId)
      } else {
        progress.unlockedAreas.delete(perk.areaId)
      }
    }
  }

  checkSpecialUnlocks(faction, level) {
    const unlocks = []
    faction.specialUnlocks.forEach((requiredLevel, unlock) => {
      if (this.getStandingValue(level) >= this.getStandingValue(requiredLevel)) {
        unlocks.push(unlock)
      }
    })
    return unlocks
  }

  handleUnlock(player, unlock) {
    switch (unlock.type) {
      case 'VENDOR':
        this.world.emit('vendorUnlocked', { vendorId: unlock.vendorId })
        break
      case 'LOCATION':
        this.world.emit('locationUnlocked', { locationId: unlock.locationId })
        break
      case 'EQUIPMENT':
        this.world.emit('equipmentUnlocked', { itemId: unlock.itemId })
        break
      case 'DIALOGUE':
        this.world.emit('dialogueUnlocked', { dialogueId: unlock.dialogueId })
        break
    }
  }

  notifyStandingChange(player, faction, oldLevel, newLevel) {
    const isImprovement = this.getStandingValue(newLevel) > this.getStandingValue(oldLevel)

    const message = {
      title: `${faction.name} Reputation ${isImprovement ? 'Increased' : 'Decreased'}`,
      text: `Your standing with ${faction.name} is now ${newLevel}`,
      type: isImprovement ? 'positive' : 'negative'
    }

    this.world.emit('notification', message)
  }

  getFactionStanding(player, factionId) {
    const reputationComponent = player.getComponent('ReputationComponent')
    if (!reputationComponent) return FactionStanding.NEUTRAL

    return reputationComponent.getStanding(factionId)
  }

  getFactionRelationship(factionId1, factionId2) {
    const faction1 = this.factions.get(factionId1)
    const faction2 = this.factions.get(factionId2)

    if (!faction1 || !faction2) return 'NEUTRAL'

    if (faction1.enemies.has(factionId2)) return 'ENEMY'
    if (faction1.allies.has(factionId2)) return 'ALLY'
    return 'NEUTRAL'
  }

  getAvailablePerks(player, factionId) {
    const faction = this.factions.get(factionId)
    if (!faction) return []

    const standing = this.getFactionStanding(player, factionId)
    const perks = []

    faction.perks.forEach((requiredLevel, perk) => {
      if (standing >= this.getStandingValue(requiredLevel)) {
        perks.push(perk)
      }
    })

    return perks
  }

  cleanup() {
    this.factions.clear()
    this.relationships.clear()
    this.reputationThresholds.clear()
    this.reputationEffects.clear()
  }
}

// Reputation Component for entities
export class ReputationComponent {
  constructor() {
    this.standings = new Map()
  }

  setStanding(factionId, value) {
    this.standings.set(factionId, value)
  }

  getStanding(factionId) {
    return this.standings.get(factionId) || FactionStanding.NEUTRAL
  }

  hasStanding(factionId) {
    return this.standings.has(factionId)
  }

  adjustStanding(factionId, amount) {
    const currentStanding = this.getStanding(factionId)
    this.setStanding(factionId, currentStanding + amount)
  }

  clearStanding(factionId) {
    this.standings.delete(factionId)
  }

  getAllStandings() {
    return new Map(this.standings)
  }
}

// Faction Definitions
export const Factions = {
  TOWN_GUARD: {
    name: "Town Guard",
    description: "The stalwart defenders of the town, maintaining order and protecting citizens from dungeon threats.",
    baseStanding: FactionStanding.NEUTRAL,
    enemies: ['GOBLIN_TRIBE', 'CULTISTS'],
    allies: ['MERCHANT_GUILD'],
    perks: new Map([
      [{
        type: 'QUEST_ACCESS',
        questLineId: 'guard_bounties',
        description: 'Access to Guard bounty quests'
      }, 'FRIENDLY'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'guard_equipment',
        description: 'Access to Guard equipment shop'
      }, 'HONORED'],
      [{
        type: 'AREA_ACCESS',
        areaId: 'guard_training_grounds',
        description: 'Access to Guard training grounds'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'DIALOGUE',
        dialogueId: 'guard_captain_special',
        description: 'Special missions from the Guard Captain'
      }, 'HONORED']
    ])
  },

  MERCHANT_GUILD: {
    name: "Merchant Guild",
    description: "The economic powerhouse of the region, controlling trade and commerce.",
    baseStanding: FactionStanding.NEUTRAL,
    enemies: ['BANDITS', 'GOBLIN_TRIBE'],
    allies: ['TOWN_GUARD'],
    perks: new Map([
      [{
        type: 'DISCOUNT',
        amount: 0.10,
        description: '10% discount at guild merchants'
      }, 'FRIENDLY'],
      [{
        type: 'DISCOUNT',
        amount: 0.20,
        description: '20% discount at guild merchants'
      }, 'HONORED'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'rare_goods',
        description: 'Access to rare merchandise'
      }, 'HONORED'],
      [{
        type: 'SKILL_BONUS',
        skillId: 'bargaining',
        amount: 2,
        description: '+2 to Bargaining skill'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'VENDOR',
        vendorId: 'master_merchant',
        description: 'Access to Master Merchant'
      }, 'EXALTED']
    ])
  },

  MAGES_CIRCLE: {
    name: "Circle of Mages",
    description: "Scholars and practitioners of the arcane arts, studying the dungeon's mysteries.",
    baseStanding: FactionStanding.NEUTRAL,
    enemies: ['CULTISTS'],
    allies: ['ALCHEMISTS_GUILD'],
    perks: new Map([
      [{
        type: 'SKILL_BONUS',
        skillId: 'arcane_knowledge',
        amount: 1,
        description: '+1 to Arcane Knowledge'
      }, 'FRIENDLY'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'spell_scrolls',
        description: 'Access to spell scroll shop'
      }, 'HONORED'],
      [{
        type: 'SKILL_BONUS',
        skillId: 'spellcasting',
        amount: 2,
        description: '+2 to Spellcasting'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'DIALOGUE',
        dialogueId: 'archmage_training',
        description: 'Special training from the Archmage'
      }, 'HONORED'],
      [{
        type: 'LOCATION',
        locationId: 'mage_library',
        description: 'Access to the Mage\'s Library'
      }, 'EXALTED']
    ])
  },

  ALCHEMISTS_GUILD: {
    name: "Alchemists Guild",
    description: "Masters of potions and elixirs, turning dungeon resources into valuable concoctions.",
    baseStanding: FactionStanding.NEUTRAL,
    enemies: [],
    allies: ['MAGES_CIRCLE', 'MERCHANT_GUILD'],
    perks: new Map([
      [{
        type: 'DISCOUNT',
        amount: 0.15,
        description: '15% discount on potions'
      }, 'FRIENDLY'],
      [{
        type: 'SKILL_BONUS',
        skillId: 'alchemy',
        amount: 1,
        description: '+1 to Alchemy'
      }, 'HONORED'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'rare_ingredients',
        description: 'Access to rare ingredients'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'EQUIPMENT',
        itemId: 'master_alchemist_satchel',
        description: 'Master Alchemist\'s Satchel'
      }, 'EXALTED']
    ])
  },

  DUNGEON_EXPLORERS: {
    name: "Dungeon Explorers League",
    description: "Professional dungeon delvers dedicated to mapping and understanding the depths.",
    baseStanding: FactionStanding.NEUTRAL,
    enemies: ['CULTISTS', 'GOBLIN_TRIBE'],
    allies: ['MERCHANT_GUILD'],
    perks: new Map([
      [{
        type: 'SKILL_BONUS',
        skillId: 'dungeoneering',
        amount: 1,
        description: '+1 to Dungeoneering'
      }, 'FRIENDLY'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'explorer_gear',
        description: 'Access to explorer equipment'
      }, 'HONORED'],
      [{
        type: 'AREA_ACCESS',
        areaId: 'secret_shortcuts',
        description: 'Knowledge of secret dungeon shortcuts'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'EQUIPMENT',
        itemId: 'master_explorer_compass',
        description: 'Master Explorer\'s Compass'
      }, 'HONORED']
    ])
  },

  GOBLIN_TRIBE: {
    name: "Goblin Tribe",
    description: "The primary inhabitants of the dungeon's upper levels, territorial but not entirely hostile.",
    baseStanding: FactionStanding.UNFRIENDLY,
    enemies: ['TOWN_GUARD', 'MERCHANT_GUILD', 'DUNGEON_EXPLORERS'],
    allies: ['BANDITS'],
    perks: new Map([
      [{
        type: 'AREA_ACCESS',
        areaId: 'goblin_market',
        description: 'Access to the Goblin Market'
      }, 'FRIENDLY'],
      [{
        type: 'DISCOUNT',
        amount: 0.25,
        description: '25% discount at Goblin merchants'
      }, 'HONORED'],
      [{
        type: 'QUEST_ACCESS',
        questLineId: 'goblin_contracts',
        description: 'Access to Goblin contracts'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'DIALOGUE',
        dialogueId: 'goblin_chief',
        description: 'Audience with the Goblin Chief'
      }, 'HONORED']
    ])
  },

  CULTISTS: {
    name: "Dungeon Cultists",
    description: "Mysterious devotees of ancient powers lurking in the dungeon's depths.",
    baseStanding: FactionStanding.HOSTILE,
    enemies: ['TOWN_GUARD', 'MAGES_CIRCLE', 'DUNGEON_EXPLORERS'],
    allies: [],
    hidden: true,
    perks: new Map([
      [{
        type: 'SKILL_BONUS',
        skillId: 'dark_magic',
        amount: 1,
        description: '+1 to Dark Magic'
      }, 'FRIENDLY'],
      [{
        type: 'AREA_ACCESS',
        areaId: 'cultist_shrine',
        description: 'Access to Cultist Shrines'
      }, 'HONORED'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'forbidden_artifacts',
        description: 'Access to Forbidden Artifacts'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'DIALOGUE',
        dialogueId: 'cult_leader',
        description: 'Audience with the Cult Leader'
      }, 'EXALTED']
    ])
  },

  BANDITS: {
    name: "Bandit Coalition",
    description: "Organized raiders who prey on merchants and explorers entering the dungeon.",
    baseStanding: FactionStanding.HOSTILE,
    enemies: ['TOWN_GUARD', 'MERCHANT_GUILD'],
    allies: ['GOBLIN_TRIBE'],
    perks: new Map([
      [{
        type: 'SKILL_BONUS',
        skillId: 'stealth',
        amount: 1,
        description: '+1 to Stealth'
      }, 'FRIENDLY'],
      [{
        type: 'INVENTORY_ACCESS',
        inventoryId: 'stolen_goods',
        description: 'Access to Stolen Goods market'
      }, 'HONORED'],
      [{
        type: 'QUEST_ACCESS',
        questLineId: 'heist_missions',
        description: 'Access to Heist missions'
      }, 'EXALTED']
    ]),
    specialUnlocks: new Map([
      [{
        type: 'LOCATION',
        locationId: 'bandit_hideout',
        description: 'Access to Bandit Hideout'
      }, 'HONORED']
    ])
  }
}
