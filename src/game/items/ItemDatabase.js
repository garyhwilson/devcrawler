// src/game/items/ItemDatabase.js

export const ItemQuality = {
  POOR: 'POOR',
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY'
}

export const ItemType = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  CONSUMABLE: 'CONSUMABLE',
  MATERIAL: 'MATERIAL',
  QUEST: 'QUEST',
  KEY: 'KEY',
  SCROLL: 'SCROLL',
  ACCESSORY: 'ACCESSORY'
}

export const WeaponType = {
  SWORD: 'SWORD',
  AXE: 'AXE',
  MACE: 'MACE',
  DAGGER: 'DAGGER',
  STAFF: 'STAFF',
  WAND: 'WAND',
  BOW: 'BOW',
  CROSSBOW: 'CROSSBOW',
  SHIELD: 'SHIELD'
}

export const ArmorType = {
  CLOTH: 'CLOTH',
  LEATHER: 'LEATHER',
  MAIL: 'MAIL',
  PLATE: 'PLATE'
}

export const ItemDatabase = {
  // Weapons
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Wooden Training Sword',
    description: 'A basic wooden sword for training.',
    type: ItemType.WEAPON,
    subType: WeaponType.SWORD,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 10,
    weight: 2,
    slots: ['MAIN_HAND'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'attackBonus',
        value: 1
      },
      {
        type: 'COMBAT_MODIFIER',
        stat: 'damage',
        value: 2
      }
    ],
    durability: { max: 50 },
    icon: 'wooden_sword_icon',
    sprite: 'wooden_sword_sprite'
  },

  rusty_dagger: {
    id: 'rusty_dagger',
    name: 'Rusty Dagger',
    description: 'A worn but serviceable dagger.',
    type: ItemType.WEAPON,
    subType: WeaponType.DAGGER,
    quality: ItemQuality.POOR,
    level: 1,
    value: 5,
    weight: 1,
    slots: ['MAIN_HAND', 'OFF_HAND'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'attackBonus',
        value: 1
      },
      {
        type: 'COMBAT_MODIFIER',
        stat: 'damage',
        value: 1
      },
      {
        type: 'SKILL_MODIFIER',
        skill: 'stealth',
        value: 1
      }
    ],
    durability: { max: 30 },
    icon: 'rusty_dagger_icon',
    sprite: 'rusty_dagger_sprite'
  },

  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A standard iron sword of decent quality.',
    type: ItemType.WEAPON,
    subType: WeaponType.SWORD,
    quality: ItemQuality.COMMON,
    level: 5,
    value: 50,
    weight: 3,
    slots: ['MAIN_HAND'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'attackBonus',
        value: 2
      },
      {
        type: 'COMBAT_MODIFIER',
        stat: 'damage',
        value: 4
      }
    ],
    requirements: {
      level: 5,
      stats: { physicality: 8 }
    },
    durability: { max: 100 },
    icon: 'iron_sword_icon',
    sprite: 'iron_sword_sprite'
  },

  apprentice_staff: {
    id: 'apprentice_staff',
    name: 'Apprentice Staff',
    description: 'A simple wooden staff imbued with magical energy.',
    type: ItemType.WEAPON,
    subType: WeaponType.STAFF,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 25,
    weight: 2,
    slots: ['MAIN_HAND'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'magicAttackBonus',
        value: 2
      },
      {
        type: 'COMBAT_MODIFIER',
        stat: 'magicDamage',
        value: 3
      },
      {
        type: 'STAT_MODIFIER',
        stat: 'manaRegen',
        value: 1
      }
    ],
    requirements: {
      stats: { mental: 8 }
    },
    durability: { max: 75 },
    icon: 'apprentice_staff_icon',
    sprite: 'apprentice_staff_sprite'
  },

  // Armor
  padded_vest: {
    id: 'padded_vest',
    name: 'Padded Vest',
    description: 'A simple padded vest offering basic protection.',
    type: ItemType.ARMOR,
    subType: ArmorType.CLOTH,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 15,
    weight: 2,
    slots: ['CHEST'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'armorClass',
        value: 1
      }
    ],
    durability: { max: 50 },
    icon: 'padded_vest_icon',
    sprite: 'padded_vest_sprite'
  },

  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'A full set of leather armor.',
    type: ItemType.ARMOR,
    subType: ArmorType.LEATHER,
    quality: ItemQuality.COMMON,
    level: 5,
    value: 75,
    weight: 8,
    slots: ['CHEST'],
    effects: [
      {
        type: 'COMBAT_MODIFIER',
        stat: 'armorClass',
        value: 3
      },
      {
        type: 'SKILL_MODIFIER',
        skill: 'stealth',
        value: 1
      }
    ],
    requirements: {
      level: 5,
      stats: { physicality: 6 }
    },
    durability: { max: 100 },
    icon: 'leather_armor_icon',
    sprite: 'leather_armor_sprite'
  },

  // Consumables
  health_potion: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'A red potion that restores health.',
    type: ItemType.CONSUMABLE,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 25,
    weight: 0.5,
    maxStack: 10,
    canUse: true,
    useEffect: {
      type: 'HEAL',
      amount: 20
    },
    cooldown: 1000,
    icon: 'health_potion_icon',
    sprite: 'health_potion_sprite'
  },

  mana_potion: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'A blue potion that restores mana.',
    type: ItemType.CONSUMABLE,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 25,
    weight: 0.5,
    maxStack: 10,
    canUse: true,
    useEffect: {
      type: 'RESTORE_MANA',
      amount: 20
    },
    cooldown: 1000,
    icon: 'mana_potion_icon',
    sprite: 'mana_potion_sprite'
  },

  antidote: {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poison effects.',
    type: ItemType.CONSUMABLE,
    quality: ItemQuality.COMMON,
    level: 1,
    value: 30,
    weight: 0.5,
    maxStack: 5,
    canUse: true,
    useEffect: {
      type: 'REMOVE_EFFECT',
      effectType: 'POISON'
    },
    icon: 'antidote_icon',
    sprite: 'antidote_sprite'
  },

  // Materials
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    description: 'Raw iron ore used in crafting.',
    type: ItemType.MATERIAL,
    quality: ItemQuality.COMMON,
    value: 10,
    weight: 2,
    maxStack: 20,
    icon: 'iron_ore_icon',
    sprite: 'iron_ore_sprite'
  },

  leather: {
    id: 'leather',
    name: 'Leather',
    description: 'Tanned leather used in crafting.',
    type: ItemType.MATERIAL,
    quality: ItemQuality.COMMON,
    value: 5,
    weight: 1,
    maxStack: 20,
    icon: 'leather_icon',
    sprite: 'leather_sprite'
  },

  // Quest Items
  ancient_rune: {
    id: 'ancient_rune',
    name: 'Ancient Rune',
    description: 'A mysterious rune covered in arcane symbols.',
    type: ItemType.QUEST,
    quality: ItemQuality.UNCOMMON,
    value: 0,
    weight: 0,
    questItem: true,
    icon: 'ancient_rune_icon',
    sprite: 'ancient_rune_sprite'
  },

  // Keys
  dungeon_key: {
    id: 'dungeon_key',
    name: 'Dungeon Key',
    description: 'A sturdy key that unlocks dungeon doors.',
    type: ItemType.KEY,
    quality: ItemQuality.COMMON,
    value: 50,
    weight: 0.5,
    canUse: true,
    useEffect: {
      type: 'KEY',
      keyId: 'dungeon_door'
    },
    icon: 'dungeon_key_icon',
    sprite: 'dungeon_key_sprite'
  },

  // Scrolls
  scroll_of_identify: {
    id: 'scroll_of_identify',
    name: 'Scroll of Identify',
    description: 'Reveals the properties of magical items.',
    type: ItemType.SCROLL,
    quality: ItemQuality.COMMON,
    value: 100,
    weight: 0.1,
    maxStack: 5,
    canUse: true,
    useEffect: {
      type: 'IDENTIFY'
    },
    requirements: {
      stats: { mental: 5 }
    },
    icon: 'identify_scroll_icon',
    sprite: 'identify_scroll_sprite'
  },

  // Accessories
  silver_ring: {
    id: 'silver_ring',
    name: 'Silver Ring',
    description: 'A simple silver ring that enhances magical ability.',
    type: ItemType.ACCESSORY,
    quality: ItemQuality.UNCOMMON,
    level: 5,
    value: 200,
    weight: 0.1,
    slots: ['RING1', 'RING2'],
    effects: [
      {
        type: 'STAT_MODIFIER',
        stat: 'mental',
        value: 1
      },
      {
        type: 'COMBAT_MODIFIER',
        stat: 'magicAttackBonus',
        value: 1
      }
    ],
    icon: 'silver_ring_icon',
    sprite: 'silver_ring_sprite'
  }
}

// Item creation helper functions
export function createItemFromTemplate(templateId, quantity = 1) {
  const template = ItemDatabase[templateId]
  if (!template) {
    throw new Error(`Item template not found: ${templateId}`)
  }

  return {
    ...template,
    quantity,
    instanceId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    durability: template.durability ? {
      current: template.durability.max,
      max: template.durability.max
    } : null
  }
}

export function generateRandomLoot(level, quality = null) {
  // Filter items by level and optional quality
  const eligibleItems = Object.values(ItemDatabase).filter(item => {
    if (item.level && item.level > level) return false
    if (quality && item.quality !== quality) return false
    if (item.type === ItemType.QUEST) return false
    return true
  })

  if (eligibleItems.length === 0) return null

  const randomItem = eligibleItems[Math.floor(Math.random() * eligibleItems.length)]
  return createItemFromTemplate(randomItem.id)
}

export function generateTreasure(level, minItems = 1, maxItems = 4) {
  const numItems = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems
  const treasure = []

  for (let i = 0; i < numItems; i++) {
    // Higher chance for better quality items based on level
    const qualityRoll = Math.random()
    let quality

    if (level >= 20 && qualityRoll > 0.9) {
      quality = ItemQuality.LEGENDARY
    } else if (level >= 15 && qualityRoll > 0.8) {
      quality = ItemQuality.EPIC
    } else if (level >= 10 && qualityRoll > 0.6) {
      quality = ItemQuality.RARE
    } else if (level >= 5 && qualityRoll > 0.4) {
      quality = ItemQuality.UNCOMMON
    } else {
      quality = ItemQuality.COMMON
    }

    const item = generateRandomLoot(level, quality)
    if (item) {
      treasure.push(item)
    }
  }

  return treasure
}
