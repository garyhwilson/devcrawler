// src/game/components/index.js

import { Component } from '../../engine/ecs';

export class StatsComponent extends Component {
  constructor(data = {}) {
    super();
    this.physicality = data.physicality || 10;
    this.mental = data.mental || 10;
    this.social = data.social || 10;

    // Derived stats
    this.maxHP = this.calculateMaxHP();
    this.currentHP = this.maxHP;
    this.armorClass = this.calculateAC();
    this.attackBonus = this.calculateAttackBonus();
  }

  calculateMaxHP() {
    return 10 + Math.floor(this.physicality / 2);
  }

  calculateAC() {
    return 10 + Math.floor(this.physicality / 4);
  }

  calculateAttackBonus() {
    return Math.floor(this.physicality / 3);
  }

  modifyStat(stat, amount) {
    if (this[stat] !== undefined) {
      this[stat] += amount;
      // Recalculate derived stats
      this.maxHP = this.calculateMaxHP();
      this.armorClass = this.calculateAC();
      this.attackBonus = this.calculateAttackBonus();
    }
  }
}

export class ProgressComponent extends Component {
  constructor(data = {}) {
    super();
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.experienceToNext = this.calculateExpToNext();
    this.experienceValue = data.experienceValue || 0; // For monsters
  }

  calculateExpToNext() {
    // Experience needed for next level = current level * 1000
    return this.level * 1000;
  }

  addExperience(amount) {
    this.experience += amount;
    while (this.experience >= this.experienceToNext) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.experience -= this.experienceToNext;
    this.experienceToNext = this.calculateExpToNext();
    // Trigger level up effects
    this.onLevelUp();
  }

  onLevelUp() {
    // Override in specific implementations
  }
}

export class InventoryComponent extends Component {
  constructor(size = 20) {
    super();
    this.size = size;
    this.items = [];
    this.equippedItems = new Map(); // slot -> item
    this.gold = 0;
  }

  addItem(item) {
    if (this.items.length >= this.size) {
      return false;
    }
    this.items.push(item);
    return true;
  }

  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  equipItem(item, slot) {
    if (this.canEquip(item, slot)) {
      const currentItem = this.equippedItems.get(slot);
      if (currentItem) {
        this.unequipItem(slot);
      }
      this.equippedItems.set(slot, item);
      this.removeItem(item);
      return true;
    }
    return false;
  }

  unequipItem(slot) {
    const item = this.equippedItems.get(slot);
    if (item && this.addItem(item)) {
      this.equippedItems.delete(slot);
      return true;
    }
    return false;
  }

  canEquip(item, slot) {
    return item.slots && item.slots.includes(slot);
  }

  getEquippedItem(slot) {
    return this.equippedItems.get(slot);
  }
}

export class ItemComponent extends Component {
  constructor(data = {}) {
    super();
    this.name = data.name || 'Unknown Item';
    this.description = data.description || '';
    this.type = data.type || 'misc';
    this.rarity = data.rarity || 'common';
    this.value = data.value || 0;
    this.weight = data.weight || 0;
    this.slots = data.slots || []; // Equipment slots this item can be equipped to
    this.effects = data.effects || []; // Status effects or bonuses
    this.requirements = data.requirements || {}; // Level, stat requirements, etc.
  }

  canUse(entity) {
    // Check if entity meets requirements
    const stats = entity.getComponent(StatsComponent);
    if (!stats) return false;

    for (const [stat, value] of Object.entries(this.requirements)) {
      if (stats[stat] < value) return false;
    }
    return true;
  }

  use(entity) {
    if (!this.canUse(entity)) return false;

    // Apply effects
    this.effects.forEach(effect => {
      effect.apply(entity);
    });
    return true;
  }
}

export class SkillComponent extends Component {
  constructor() {
    super();
    this.skills = new Map();
    this.skillPoints = 0;
  }

  addSkill(skillName, level = 0) {
    this.skills.set(skillName, {
      level,
      maxLevel: 5,
      requirements: {},
      effects: []
    });
  }

  upgradeSkill(skillName) {
    const skill = this.skills.get(skillName);
    if (!skill || skill.level >= skill.maxLevel || this.skillPoints <= 0) {
      return false;
    }

    skill.level++;
    this.skillPoints--;
    return true;
  }

  addSkillPoint() {
    this.skillPoints++;
  }

  getSkillLevel(skillName) {
    const skill = this.skills.get(skillName);
    return skill ? skill.level : 0;
  }
}

export class CombatComponent extends Component {
  constructor(data = {}) {
    super();
    this.attackRange = data.attackRange || 1;
    this.baseDamage = data.baseDamage || 1;
    this.variableDamage = data.variableDamage || 2;
    this.attackBonus = data.attackBonus || 0;
    this.armorClass = data.armorClass || 10;
    this.currentHP = data.maxHP || 10;
    this.maxHP = data.maxHP || 10;
    this.statusEffects = new Map();
  }

  takeDamage(amount) {
    this.currentHP = Math.max(0, this.currentHP - amount);
    return this.currentHP === 0;
  }

  heal(amount) {
    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  addStatusEffect(effect) {
    this.statusEffects.set(effect.name, effect);
  }

  removeStatusEffect(effectName) {
    this.statusEffects.delete(effectName);
  }

  updateStatusEffects(deltaTime) {
    for (const [name, effect] of this.statusEffects) {
      effect.update(deltaTime);
      if (effect.isExpired()) {
        this.statusEffects.delete(name);
      }
    }
  }
}

export class DialogComponent extends Component {
  constructor() {
    super();
    this.dialogs = new Map();
    this.currentDialog = null;
    this.currentNode = null;
  }

  addDialog(id, dialog) {
    this.dialogs.set(id, dialog);
  }

  startDialog(id) {
    const dialog = this.dialogs.get(id);
    if (dialog) {
      this.currentDialog = dialog;
      this.currentNode = dialog.startNode;
      return true;
    }
    return false;
  }

  getNextNodes() {
    if (!this.currentDialog || !this.currentNode) return [];

    return this.currentNode.options.filter(option => {
      if (!option.condition) return true;
      return option.condition();
    });
  }

  selectOption(optionIndex) {
    const options = this.getNextNodes();
    const selectedOption = options[optionIndex];

    if (selectedOption) {
      // Execute any actions associated with this option
      if (selectedOption.action) {
        selectedOption.action();
      }

      // Move to the next node
      this.currentNode = this.currentDialog.nodes[selectedOption.nextNode];
      return true;
    }
    return false;
  }

  endDialog() {
    this.currentDialog = null;
    this.currentNode = null;
  }
}

export class UIComponent extends Component {
  constructor() {
    super();
    this.activeMenus = new Set();
    this.widgets = new Map();
    this.tooltips = new Map();
    this.notifications = [];
  }

  toggleMenu(menuName) {
    if (this.activeMenus.has(menuName)) {
      this.activeMenus.delete(menuName);
    } else {
      this.activeMenus.add(menuName);
    }
  }

  addWidget(id, widget) {
    this.widgets.set(id, widget);
  }

  removeWidget(id) {
    this.widgets.delete(id);
  }

  showTooltip(id, content, position) {
    this.tooltips.set(id, {
      content,
      position,
      timestamp: Date.now()
    });
  }

  hideTooltip(id) {
    this.tooltips.delete(id);
  }

  addNotification(message, type = 'info', duration = 3000) {
    const notification = {
      id: Date.now(),
      message,
      type,
      duration,
      timestamp: Date.now()
    };
    this.notifications.push(notification);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, duration);
  }

  removeNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  update(deltaTime) {
    // Update tooltips (remove old ones)
    for (const [id, tooltip] of this.tooltips) {
      if (Date.now() - tooltip.timestamp > 3000) {
        this.tooltips.delete(id);
      }
    }

    // Update notifications (remove expired ones)
    this.notifications = this.notifications.filter(notification => {
      return Date.now() - notification.timestamp < notification.duration;
    });
  }
}

export class QuestComponent extends Component {
  constructor() {
    super();
    this.quests = new Map();
    this.activeQuests = new Set();
    this.completedQuests = new Set();
  }

  addQuest(quest) {
    this.quests.set(quest.id, quest);
  }

  startQuest(questId) {
    const quest = this.quests.get(questId);
    if (quest && !this.activeQuests.has(questId) && !this.completedQuests.has(questId)) {
      this.activeQuests.add(questId);
      quest.onStart?.();
      return true;
    }
    return false;
  }

  updateQuest(questId, progress) {
    const quest = this.quests.get(questId);
    if (quest && this.activeQuests.has(questId)) {
      quest.progress = progress;

      // Check if quest is complete
      if (quest.isComplete()) {
        this.completeQuest(questId);
      }
      return true;
    }
    return false;
  }

  completeQuest(questId) {
    const quest = this.quests.get(questId);
    if (quest && this.activeQuests.has(questId)) {
      this.activeQuests.delete(questId);
      this.completedQuests.add(questId);
      quest.onComplete?.();
      return true;
    }
    return false;
  }

  getQuestProgress(questId) {
    const quest = this.quests.get(questId);
    return quest ? quest.progress : null;
  }

  isQuestComplete(questId) {
    return this.completedQuests.has(questId);
  }

  isQuestActive(questId) {
    return this.activeQuests.has(questId);
  }
}

export class StatusEffectComponent extends Component {
  constructor() {
    super();
    this.effects = new Map();
  }

  addEffect(effect) {
    this.effects.set(effect.id, {
      ...effect,
      startTime: Date.now(),
      remaining: effect.duration
    });
  }

  removeEffect(effectId) {
    const effect = this.effects.get(effectId);
    if (effect) {
      effect.onRemove?.();
      this.effects.delete(effectId);
    }
  }

  update(deltaTime) {
    for (const [id, effect] of this.effects) {
      effect.remaining -= deltaTime;

      // Apply periodic effects
      if (effect.periodic) {
        effect.periodicTimer = (effect.periodicTimer || 0) + deltaTime;
        if (effect.periodicTimer >= effect.periodicInterval) {
          effect.onPeriodic?.();
          effect.periodicTimer = 0;
        }
      }

      // Remove expired effects
      if (effect.remaining <= 0) {
        this.removeEffect(id);
      }
    }
  }

  hasEffect(effectId) {
    return this.effects.has(effectId);
  }

  getEffectRemaining(effectId) {
    const effect = this.effects.get(effectId);
    return effect ? effect.remaining : 0;
  }
}

export class LootComponent extends Component {
  constructor(data = {}) {
    super();
    this.lootTable = data.lootTable || [];
    this.minGold = data.minGold || 0;
    this.maxGold = data.maxGold || 0;
    this.guaranteedItems = data.guaranteedItems || [];
  }

  generateLoot() {
    const loot = {
      items: [],
      gold: Math.floor(Math.random() * (this.maxGold - this.minGold + 1)) + this.minGold
    };

    // Add guaranteed items
    loot.items.push(...this.guaranteedItems);

    // Roll for random items
    this.lootTable.forEach(entry => {
      if (Math.random() < entry.chance) {
        loot.items.push(entry.item);
      }
    });

    return loot;
  }

  dropLoot(position) {
    const loot = this.generateLoot();

    // Create gold entity if there's gold
    if (loot.gold > 0) {
      this.createGoldEntity(position, loot.gold);
    }

    // Create item entities
    loot.items.forEach(item => {
      this.createItemEntity(position, item);
    });
  }

  createGoldEntity(position, amount) {
    // Implementation will be added when we create the entity factory
  }

  createItemEntity(position, item) {
    // Implementation will be added when we create the entity factory
  }
}
