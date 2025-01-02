// src/game/systems/InventorySystem.js

export class InventorySystem {
  constructor(world) {
    this.world = world
    this.itemDatabase = new Map()
    this.equippableSlots = new Set([
      'HEAD', 'NECK', 'SHOULDERS', 'CHEST', 'BACK',
      'WRISTS', 'HANDS', 'WAIST', 'LEGS', 'FEET',
      'MAIN_HAND', 'OFF_HAND', 'RING1', 'RING2',
      'TRINKET1', 'TRINKET2', 'AMMO'
    ])
    this.activeTradeWindow = null
  }

  registerItem(itemData) {
    this.itemDatabase.set(itemData.id, {
      ...itemData,
      effects: itemData.effects || [],
      requirements: itemData.requirements || {},
      properties: itemData.properties || {}
    })
  }

  createItem(itemId, quantity = 1) {
    const template = this.itemDatabase.get(itemId)
    if (!template) {
      console.warn(`Item template not found: ${itemId}`)
      return null
    }

    return new Item({
      ...template,
      quantity,
      instanceId: this.generateItemInstanceId()
    })
  }

  generateItemInstanceId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  addItemToInventory(entity, itemId, quantity = 1) {
    const inventory = entity.getComponent('InventoryComponent')
    if (!inventory) return false

    const item = this.createItem(itemId, quantity)
    if (!item) return false

    return this.addItem(inventory, item)
  }

  addItem(inventory, item) {
    // Check for stackable items
    if (item.isStackable) {
      const existingStack = inventory.items.find(i =>
        i.id === item.id && i.canStackWith(item)
      )

      if (existingStack) {
        existingStack.quantity += item.quantity
        this.onInventoryChanged(inventory)
        return true
      }
    }

    // Check inventory space
    if (inventory.items.length >= inventory.maxSize) {
      this.world.emit('inventoryFull', { inventory, item })
      return false
    }

    inventory.items.push(item)
    this.onInventoryChanged(inventory)
    return true
  }

  removeItem(inventory, item, quantity = 1) {
    const index = inventory.items.findIndex(i => i.instanceId === item.instanceId)
    if (index === -1) return false

    const inventoryItem = inventory.items[index]

    if (inventoryItem.quantity > quantity) {
      inventoryItem.quantity -= quantity
    } else {
      inventory.items.splice(index, 1)
    }

    this.onInventoryChanged(inventory)
    return true
  }

  moveItem(fromInventory, toInventory, item, quantity = 1) {
    if (quantity > item.quantity) return false

    // Create a new item instance for the move
    const moveItem = this.createItem(item.id, quantity)
    if (!moveItem) return false

    // Try to add to the destination first
    if (!this.addItem(toInventory, moveItem)) return false

    // Then remove from source
    return this.removeItem(fromInventory, item, quantity)
  }

  equipItem(entity, item) {
    const inventory = entity.getComponent('InventoryComponent')
    const equipment = entity.getComponent('EquipmentComponent')
    if (!inventory || !equipment) return false

    // Check requirements
    if (!this.meetsRequirements(entity, item)) {
      this.world.emit('requirementsNotMet', { entity, item })
      return false
    }

    // Check if item is equippable
    if (!item.slots || item.slots.length === 0) {
      console.warn(`Item ${item.id} has no equipment slots defined`)
      return false
    }

    // Find first available slot
    const slot = item.slots.find(s => this.canEquipToSlot(equipment, s))
    if (!slot) {
      this.world.emit('noValidSlot', { entity, item })
      return false
    }

    // Unequip existing item in slot if any
    const existingItem = equipment.getItemInSlot(slot)
    if (existingItem) {
      this.unequipItem(entity, existingItem)
    }

    // Remove from inventory and equip
    if (!this.removeItem(inventory, item)) return false

    equipment.equip(slot, item)
    this.applyEquipmentEffects(entity, item, true)

    this.world.emit('itemEquipped', { entity, item, slot })
    return true
  }

  unequipItem(entity, item) {
    const inventory = entity.getComponent('InventoryComponent')
    const equipment = entity.getComponent('EquipmentComponent')
    if (!inventory || !equipment) return false

    // Check inventory space
    if (inventory.items.length >= inventory.maxSize) {
      this.world.emit('inventoryFull', { inventory, item })
      return false
    }

    const slot = equipment.findSlotWithItem(item)
    if (!slot) return false

    equipment.unequip(slot)
    this.applyEquipmentEffects(entity, item, false)
    this.addItem(inventory, item)

    this.world.emit('itemUnequipped', { entity, item, slot })
    return true
  }

  canEquipToSlot(equipment, slot) {
    if (!this.equippableSlots.has(slot)) return false
    return !equipment.getItemInSlot(slot)
  }

  meetsRequirements(entity, item) {
    if (!item.requirements) return true

    const stats = entity.getComponent('StatsComponent')
    const skills = entity.getComponent('SkillComponent')

    // Check level requirement
    if (item.requirements.level) {
      const progress = entity.getComponent('ProgressComponent')
      if (!progress || progress.level < item.requirements.level) {
        return false
      }
    }

    // Check stat requirements
    if (item.requirements.stats && stats) {
      for (const [stat, value] of Object.entries(item.requirements.stats)) {
        if (stats[stat] < value) return false
      }
    }

    // Check skill requirements
    if (item.requirements.skills && skills) {
      for (const [skill, value] of Object.entries(item.requirements.skills)) {
        if (skills.getSkillLevel(skill) < value) return false
      }
    }

    // Check faction requirements
    if (item.requirements.faction) {
      const reputation = entity.getComponent('ReputationComponent')
      if (!reputation) return false

      const standing = reputation.getStanding(item.requirements.faction.id)
      if (standing < item.requirements.faction.standing) return false
    }

    return true
  }

  applyEquipmentEffects(entity, item, isEquipping) {
    if (!item.effects) return

    const multiplier = isEquipping ? 1 : -1

    item.effects.forEach(effect => {
      switch (effect.type) {
        case 'STAT_MODIFIER':
          this.applyStatModifier(entity, effect, multiplier)
          break
        case 'SKILL_MODIFIER':
          this.applySkillModifier(entity, effect, multiplier)
          break
        case 'COMBAT_MODIFIER':
          this.applyCombatModifier(entity, effect, multiplier)
          break
        case 'SPECIAL_EFFECT':
          this.applySpecialEffect(entity, effect, isEquipping)
          break
      }
    })
  }

  applyStatModifier(entity, effect, multiplier) {
    const stats = entity.getComponent('StatsComponent')
    if (!stats || !effect.stat) return

    stats[effect.stat] += effect.value * multiplier
  }

  applySkillModifier(entity, effect, multiplier) {
    const skills = entity.getComponent('SkillComponent')
    if (!skills || !effect.skill) return

    skills.addBonus(effect.skill, effect.value * multiplier)
  }

  applyCombatModifier(entity, effect, multiplier) {
    const combat = entity.getComponent('CombatComponent')
    if (!combat || !effect.stat) return

    combat[effect.stat] += effect.value * multiplier
  }

  applySpecialEffect(entity, effect, isEquipping) {
    // Handle special effects (procs, triggers, etc.)
    const specialEffects = entity.getComponent('StatusEffectComponent')
    if (!specialEffects) return

    if (isEquipping) {
      specialEffects.addEffect(effect)
    } else {
      specialEffects.removeEffect(effect.id)
    }
  }

  useItem(entity, item) {
    if (!item.canUse) return false

    const result = item.use(entity)
    if (!result) return false

    const inventory = entity.getComponent('InventoryComponent')
    if (!inventory) return false

    this.removeItem(inventory, item, 1)
    this.world.emit('itemUsed', { entity, item })
    return true
  }

  startTrade(buyer, seller) {
    if (this.activeTradeWindow) {
      this.endTrade()
    }

    this.activeTradeWindow = {
      buyer,
      seller,
      buyerItems: new Set(),
      sellerItems: new Set(),
      buyerGold: 0,
      sellerGold: 0
    }

    this.world.emit('tradeStarted', { buyer, seller })
    return true
  }

  addToTrade(entity, item, quantity = 1) {
    if (!this.activeTradeWindow) return false

    const isBuyer = entity === this.activeTradeWindow.buyer
    const itemSet = isBuyer ?
      this.activeTradeWindow.buyerItems :
      this.activeTradeWindow.sellerItems

    itemSet.add({ item, quantity })
    this.world.emit('tradeUpdated', this.activeTradeWindow)
    return true
  }

  removeFromTrade(entity, item) {
    if (!this.activeTradeWindow) return false

    const isBuyer = entity === this.activeTradeWindow.buyer
    const itemSet = isBuyer ?
      this.activeTradeWindow.buyerItems :
      this.activeTradeWindow.sellerItems

    itemSet.delete(item)
    this.world.emit('tradeUpdated', this.activeTradeWindow)
    return true
  }

  setTradeGold(entity, amount) {
    if (!this.activeTradeWindow) return false

    if (entity === this.activeTradeWindow.buyer) {
      this.activeTradeWindow.buyerGold = amount
    } else if (entity === this.activeTradeWindow.seller) {
      this.activeTradeWindow.sellerGold = amount
    }

    this.world.emit('tradeUpdated', this.activeTradeWindow)
    return true
  }

  confirmTrade(entity) {
    if (!this.activeTradeWindow) return false

    const trade = this.activeTradeWindow
    const isBuyer = entity === trade.buyer

    // Mark entity as confirmed
    if (isBuyer) {
      trade.buyerConfirmed = true
    } else {
      trade.sellerConfirmed = true
    }

    // If both confirmed, execute trade
    if (trade.buyerConfirmed && trade.sellerConfirmed) {
      this.executeTrade()
    } else {
      this.world.emit('tradeConfirmed', { entity })
    }

    return true
  }

  executeTrade() {
    const trade = this.activeTradeWindow
    if (!trade) return false

    const buyerInventory = trade.buyer.getComponent('InventoryComponent')
    const sellerInventory = trade.seller.getComponent('InventoryComponent')
    if (!buyerInventory || !sellerInventory) return false

    // Verify buyer has enough gold
    if (buyerInventory.gold < trade.buyerGold) return false

    // Verify seller has enough gold
    if (sellerInventory.gold < trade.sellerGold) return false

    // Verify items are still available
    for (const { item, quantity } of trade.buyerItems) {
      if (!this.hasItem(buyerInventory, item, quantity)) return false
    }
    for (const { item, quantity } of trade.sellerItems) {
      if (!this.hasItem(sellerInventory, item, quantity)) return false
    }

    // Execute the trade
    // Transfer items from buyer to seller
    for (const { item, quantity } of trade.buyerItems) {
      this.moveItem(buyerInventory, sellerInventory, item, quantity)
    }

    // Transfer items from seller to buyer
    for (const { item, quantity } of trade.sellerItems) {
      this.moveItem(sellerInventory, buyerInventory, item, quantity)
    }

    // Transfer gold
    buyerInventory.gold -= trade.buyerGold
    sellerInventory.gold += trade.buyerGold
    sellerInventory.gold -= trade.sellerGold
    buyerInventory.gold += trade.sellerGold

    this.world.emit('tradeCompleted', trade)
    this.endTrade()
    return true
  }

  cancelTrade() {
    if (!this.activeTradeWindow) return

    this.world.emit('tradeCancelled', this.activeTradeWindow)
    this.endTrade()
  }

  endTrade() {
    this.activeTradeWindow = null
  }

  hasItem(inventory, item, quantity = 1) {
    const found = inventory.items.find(i => i.instanceId === item.instanceId)
    return found && found.quantity >= quantity
  }

  getItemValue(item, entity = null) {
    let baseValue = item.value || 0

    // Apply quality multiplier
    const qualityMultipliers = {
      'POOR': 0.5,
      'COMMON': 1.0,
      'UNCOMMON': 1.5,
      'RARE': 2.5,
      'EPIC': 5.0,
      'LEGENDARY': 10.0
    }
    baseValue *= qualityMultipliers[item.quality] || 1.0

    // Apply reputation discounts if buying from vendor
    if (entity) {
      const reputation = entity.getComponent('ReputationComponent')
      if (reputation) {
        const standing = reputation.getStanding(item.factionId)
        baseValue *= this.getReputationPriceMultiplier(standing)
      }
    }

    return Math.floor(baseValue)
  }

  getReputationPriceMultiplier(standing) {
    if (standing >= FactionStanding.EXALTED) return 0.8
    if (standing >= FactionStanding.HONORED) return 0.85
    if (standing >= FactionStanding.FRIENDLY) return 0.9
    if (standing >= FactionStanding.NEUTRAL) return 1.0
    if (standing >= FactionStanding.UNFRIENDLY) return 1.1
    if (standing >= FactionStanding.HOSTILE) return 1.25
    return 1.5 // HATED
  }

  onInventoryChanged(inventory) {
    const entity = this.world.findEntityByComponent(inventory)
    if (entity) {
      this.world.emit('inventoryChanged', { entity, inventory })
    }
  }

  cleanup() {
    this.itemDatabase.clear()
    this.endTrade()
  }
}

// Item class definition
export class Item {
  constructor(config) {
    this.id = config.id
    this.instanceId = config.instanceId
    this.name = config.name
    this.description = config.description
    this.type = config.type
    this.subType = config.subType
    this.quality = config.quality || 'COMMON'
    this.level = config.level || 1
    this.value = config.value || 0
    this.weight = config.weight || 0
    this.quantity = config.quantity || 1
    this.maxStack = config.maxStack || 1
    this.isStackable = config.maxStack > 1
    this.slots = config.slots || []
    this.effects = config.effects || []
    this.requirements = config.requirements || {}
    this.properties = config.properties || {}
    this.durability = config.durability ? {
      current: config.durability.max,
      max: config.durability.max
    } : null
    this.sprite = config.sprite
    this.icon = config.icon
    this.sound = config.sound
    this.canUse = config.canUse || false
    this.useEffect = config.useEffect
    this.cooldown = config.cooldown || 0
    this.lastUsed = 0
    this.factionId = config.factionId
    this.boundToPlayer = config.boundToPlayer || false
    this.questItem = config.questItem || false
  }

  canStackWith(otherItem) {
    if (!this.isStackable || !otherItem.isStackable) return false
    if (this.id !== otherItem.id) return false
    if (this.quality !== otherItem.quality) return false
    if (this.boundToPlayer !== otherItem.boundToPlayer) return false

    // Check if properties match
    return JSON.stringify(this.properties) === JSON.stringify(otherItem.properties)
  }

  split(amount) {
    if (amount >= this.quantity) return null

    const newItem = new Item({
      ...this,
      quantity: amount,
      instanceId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })

    this.quantity -= amount
    return newItem
  }

  merge(otherItem) {
    if (!this.canStackWith(otherItem)) return false

    const totalQuantity = this.quantity + otherItem.quantity
    if (totalQuantity > this.maxStack) return false

    this.quantity = totalQuantity
    return true
  }

  use(entity) {
    if (!this.canUse) return false

    // Check cooldown
    const now = Date.now()
    if (now - this.lastUsed < this.cooldown) return false

    // Check requirements
    if (!this.meetsRequirements(entity)) return false

    // Execute use effect
    if (this.useEffect) {
      const success = this.executeUseEffect(entity)
      if (!success) return false
    }

    this.lastUsed = now
    return true
  }

  meetsRequirements(entity) {
    const stats = entity.getComponent('StatsComponent')
    const skills = entity.getComponent('SkillComponent')

    // Check level requirement
    if (this.requirements.level) {
      const progress = entity.getComponent('ProgressComponent')
      if (!progress || progress.level < this.requirements.level) {
        return false
      }
    }

    // Check stat requirements
    if (this.requirements.stats && stats) {
      for (const [stat, value] of Object.entries(this.requirements.stats)) {
        if (stats[stat] < value) return false
      }
    }

    // Check skill requirements
    if (this.requirements.skills && skills) {
      for (const [skill, value] of Object.entries(this.requirements.skills)) {
        if (skills.getSkillLevel(skill) < value) return false
      }
    }

    return true
  }

  executeUseEffect(entity) {
    switch (this.useEffect.type) {
      case 'HEAL':
        return this.executeHealEffect(entity)
      case 'RESTORE_MANA':
        return this.executeRestoreManaEffect(entity)
      case 'BUFF':
        return this.executeBuffEffect(entity)
      case 'TELEPORT':
        return this.executeTeleportEffect(entity)
      case 'IDENTIFY':
        return this.executeIdentifyEffect(entity)
      case 'REPAIR':
        return this.executeRepairEffect(entity)
      case 'KEY':
        return this.executeKeyEffect(entity)
      default:
        console.warn(`Unknown use effect type: ${this.useEffect.type}`)
        return false
    }
  }

  executeHealEffect(entity) {
    const combat = entity.getComponent('CombatComponent')
    if (!combat) return false

    const healAmount = this.useEffect.amount
    const oldHP = combat.currentHP
    combat.heal(healAmount)

    const actualHeal = combat.currentHP - oldHP
    if (actualHeal > 0) {
      entity.world.emit('entityHealed', {
        entity,
        amount: actualHeal,
        source: this
      })
      return true
    }
    return false
  }

  executeRestoreManaEffect(entity) {
    const stats = entity.getComponent('StatsComponent')
    if (!stats || !stats.mana) return false

    const manaAmount = this.useEffect.amount
    const oldMana = stats.mana
    stats.mana = Math.min(stats.maxMana, stats.mana + manaAmount)

    const actualMana = stats.mana - oldMana
    if (actualMana > 0) {
      entity.world.emit('manaRestored', {
        entity,
        amount: actualMana,
        source: this
      })
      return true
    }
    return false
  }

  executeBuffEffect(entity) {
    const status = entity.getComponent('StatusEffectComponent')
    if (!status) return false

    const buffEffect = {
      id: `buff_${Date.now()}`,
      name: this.useEffect.name,
      duration: this.useEffect.duration,
      modifiers: this.useEffect.modifiers
    }

    status.addEffect(buffEffect)
    entity.world.emit('buffApplied', {
      entity,
      effect: buffEffect,
      source: this
    })
    return true
  }

  executeTeleportEffect(entity) {
    const transform = entity.getComponent('TransformComponent')
    if (!transform) return false

    const destination = this.useEffect.destination
    if (!entity.world.isValidPosition(destination.x, destination.y)) {
      return false
    }

    transform.x = destination.x
    transform.y = destination.y
    entity.world.emit('entityTeleported', {
      entity,
      destination,
      source: this
    })
    return true
  }

  executeIdentifyEffect(entity) {
    const inventory = entity.getComponent('InventoryComponent')
    if (!inventory) return false

    const targetItem = inventory.getSelectedItem()
    if (!targetItem || !targetItem.properties.unidentified) {
      return false
    }

    delete targetItem.properties.unidentified
    entity.world.emit('itemIdentified', {
      entity,
      item: targetItem,
      source: this
    })
    return true
  }

  executeRepairEffect(entity) {
    const inventory = entity.getComponent('InventoryComponent')
    if (!inventory) return false

    const targetItem = inventory.getSelectedItem()
    if (!targetItem || !targetItem.durability) {
      return false
    }

    const oldDurability = targetItem.durability.current
    targetItem.durability.current = Math.min(
      targetItem.durability.max,
      targetItem.durability.current + this.useEffect.amount
    )

    const repairAmount = targetItem.durability.current - oldDurability
    if (repairAmount > 0) {
      entity.world.emit('itemRepaired', {
        entity,
        item: targetItem,
        amount: repairAmount,
        source: this
      })
      return true
    }
    return false
  }

  executeKeyEffect(entity) {
    const world = entity.world
    const transform = entity.getComponent('TransformComponent')
    if (!transform) return false

    // Check for locked door in adjacent tiles
    const adjacentTiles = world.getAdjacentTiles(transform.x, transform.y)
    for (const tile of adjacentTiles) {
      if (tile.type === 'door' && tile.properties.locked) {
        if (tile.properties.keyId === this.useEffect.keyId) {
          tile.properties.locked = false
          world.emit('doorUnlocked', {
            entity,
            door: tile,
            source: this
          })
          return true
        }
      }
    }
    return false
  }

  takeDamage(amount) {
    if (!this.durability) return false

    const oldDurability = this.durability.current
    this.durability.current = Math.max(0, this.durability.current - amount)

    return {
      damaged: oldDurability !== this.durability.current,
      broken: this.durability.current === 0
    }
  }

  repair(amount) {
    if (!this.durability) return false

    const oldDurability = this.durability.current
    this.durability.current = Math.min(
      this.durability.max,
      this.durability.current + amount
    )

    return this.durability.current - oldDurability
  }

  clone() {
    return new Item({
      ...this,
      instanceId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  }
}
