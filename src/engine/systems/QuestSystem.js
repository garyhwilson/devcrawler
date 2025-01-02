// src/game/systems/QuestSystem.js

export class QuestSystem {
  constructor(world) {
    this.world = world;
    this.quests = new Map();
    this.activeQuests = new Map();
    this.completedQuests = new Set();
    this.questChains = new Map();
    this.questListeners = new Map();
    this.questTriggers = new Set();
  }

  // Quest Management
  registerQuest(quest) {
    this.quests.set(quest.id, quest);

    // Set up event listeners for this quest's objectives
    quest.objectives.forEach(objective => {
      this.setupObjectiveListener(quest.id, objective);
    });

    // Register quest chain if this quest is part of one
    if (quest.chainId) {
      if (!this.questChains.has(quest.chainId)) {
        this.questChains.set(quest.chainId, []);
      }
      this.questChains.get(quest.chainId).push(quest.id);
    }
  }

  startQuest(questId, entity) {
    const quest = this.quests.get(questId);
    if (!quest || !this.canStartQuest(questId, entity)) return false;

    // Initialize quest progress
    const questProgress = new QuestProgress(quest);
    this.activeQuests.set(questId, questProgress);

    // Activate quest triggers
    quest.objectives.forEach(objective => {
      this.activateObjectiveTrigger(questId, objective);
    });

    // Update entity's quest component
    const questComponent = entity.getComponent('QuestComponent');
    if (questComponent) {
      questComponent.addQuest(questId);
    }

    // Notify quest start
    this.world.emit('questStarted', { questId, entity });

    return true;
  }

  updateQuestProgress(questId, type, data) {
    const progress = this.activeQuests.get(questId);
    if (!progress) return;

    const quest = this.quests.get(questId);
    if (!quest) return;

    // Update objectives matching the event type
    quest.objectives
      .filter(obj => obj.type === type)
      .forEach(objective => {
        this.updateObjectiveProgress(progress, objective, data);
      });

    // Check if quest is complete
    if (this.checkQuestCompletion(questId)) {
      this.completeQuest(questId);
    }
  }

  completeQuest(questId) {
    const quest = this.quests.get(questId);
    const progress = this.activeQuests.get(questId);
    if (!quest || !progress) return;

    // Award rewards
    this.grantQuestRewards(quest);

    // Move to completed quests
    this.completedQuests.add(questId);
    this.activeQuests.delete(questId);

    // Remove quest triggers
    quest.objectives.forEach(objective => {
      this.deactivateObjectiveTrigger(questId, objective);
    });

    // Check for follow-up quests
    if (quest.chainId) {
      this.checkQuestChainProgression(quest.chainId);
    }

    // Notify quest completion
    this.world.emit('questCompleted', { questId });
  }

  failQuest(questId, reason) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    // Remove from active quests
    this.activeQuests.delete(questId);

    // Remove quest triggers
    quest.objectives.forEach(objective => {
      this.deactivateObjectiveTrigger(questId, objective);
    });

    // Notify quest failure
    this.world.emit('questFailed', { questId, reason });
  }

  // Progress Tracking
  updateObjectiveProgress(progress, objective, data) {
    switch (objective.type) {
      case 'kill':
        if (data.entityType === objective.targetType) {
          progress.incrementObjective(objective.id);
        }
        break;
      case 'collect':
        if (data.itemType === objective.itemType) {
          progress.incrementObjective(objective.id, data.amount || 1);
        }
        break;
      case 'explore':
        if (this.isInTargetArea(data.position, objective.area)) {
          progress.completeObjective(objective.id);
        }
        break;
      case 'interact':
        if (data.targetId === objective.targetId) {
          progress.completeObjective(objective.id);
        }
        break;
      case 'escort':
        if (data.npcId === objective.npcId &&
          this.isInTargetArea(data.position, objective.destination)) {
          progress.completeObjective(objective.id);
        }
        break;
      case 'defend':
        if (data.locationId === objective.locationId &&
          data.timeDefended >= objective.requiredTime) {
          progress.completeObjective(objective.id);
        }
        break;
      // Add more objective types as needed
    }
  }

  checkQuestCompletion(questId) {
    const progress = this.activeQuests.get(questId);
    const quest = this.quests.get(questId);
    if (!progress || !quest) return false;

    return quest.objectives.every(objective =>
      progress.isObjectiveComplete(objective.id)
    );
  }

  // Quest Chain Management
  checkQuestChainProgression(chainId) {
    const chain = this.questChains.get(chainId);
    if (!chain) return;

    // Find the next quest in the chain
    const currentIndex = chain.findIndex(questId =>
      this.completedQuests.has(questId)
    );

    if (currentIndex < chain.length - 1) {
      const nextQuestId = chain[currentIndex + 1];
      const player = this.world.findEntityByTag('player');
      if (player) {
        this.startQuest(nextQuestId, player);
      }
    }
  }

  // Quest Requirements and Validation
  canStartQuest(questId, entity) {
    const quest = this.quests.get(questId);
    if (!quest || this.activeQuests.has(questId) ||
      this.completedQuests.has(questId)) {
      return false;
    }

    // Check prerequisites
    if (quest.prerequisites) {
      if (quest.prerequisites.level) {
        const progress = entity.getComponent('ProgressComponent');
        if (!progress || progress.level < quest.prerequisites.level) {
          return false;
        }
      }

      if (quest.prerequisites.quests) {
        if (!quest.prerequisites.quests.every(prereqId =>
          this.completedQuests.has(prereqId))) {
          return false;
        }
      }

      if (quest.prerequisites.items) {
        const inventory = entity.getComponent('InventoryComponent');
        if (!inventory || !quest.prerequisites.items.every(item =>
          inventory.hasItem(item.id, item.amount))) {
          return false;
        }
      }

      if (quest.prerequisites.faction) {
        const reputation = entity.getComponent('ReputationComponent');
        if (!reputation ||
          reputation.getFactionStanding(quest.prerequisites.faction.id) <
          quest.prerequisites.faction.standing) {
          return false;
        }
      }
    }

    return true;
  }

  // Reward Handling
  grantQuestRewards(quest) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    if (quest.rewards) {
      // Experience points
      if (quest.rewards.experience) {
        const progress = player.getComponent('ProgressComponent');
        if (progress) {
          progress.addExperience(quest.rewards.experience);
        }
      }

      // Items
      if (quest.rewards.items) {
        const inventory = player.getComponent('InventoryComponent');
        if (inventory) {
          quest.rewards.items.forEach(item => {
            inventory.addItem(item);
          });
        }
      }

      // Gold
      if (quest.rewards.gold) {
        const inventory = player.getComponent('InventoryComponent');
        if (inventory) {
          inventory.gold += quest.rewards.gold;
        }
      }

      // Faction reputation
      if (quest.rewards.reputation) {
        const reputation = player.getComponent('ReputationComponent');
        if (reputation) {
          Object.entries(quest.rewards.reputation).forEach(([factionId, amount]) => {
            reputation.adjustFactionStanding(factionId, amount);
          });
        }
      }

      // Skills
      if (quest.rewards.skills) {
        const skills = player.getComponent('SkillComponent');
        if (skills) {
          quest.rewards.skills.forEach(skill => {
            skills.addSkillPoints(skill.id, skill.points);
          });
        }
      }
    }
  }

  // Event Handling
  setupObjectiveListener(questId, objective) {
    const listener = (data) => {
      this.updateQuestProgress(questId, objective.type, data);
    };

    const eventType = this.getEventTypeForObjective(objective);
    this.questListeners.set(`${questId}_${objective.id}`, {
      eventType,
      listener
    });
  }

  activateObjectiveTrigger(questId, objective) {
    const listenerInfo = this.questListeners.get(`${questId}_${objective.id}`);
    if (listenerInfo) {
      this.world.on(listenerInfo.eventType, listenerInfo.listener);
      this.questTriggers.add(`${questId}_${objective.id}`);
    }
  }

  deactivateObjectiveTrigger(questId, objective) {
    const listenerInfo = this.questListeners.get(`${questId}_${objective.id}`);
    if (listenerInfo) {
      this.world.off(listenerInfo.eventType, listenerInfo.listener);
      this.questTriggers.delete(`${questId}_${objective.id}`);
    }
  }

  getEventTypeForObjective(objective) {
    switch (objective.type) {
      case 'kill': return 'entityKilled';
      case 'collect': return 'itemCollected';
      case 'explore': return 'areaExplored';
      case 'interact': return 'entityInteraction';
      case 'escort': return 'npcMoved';
      case 'defend': return 'areaDefended';
      default: return 'questEvent';
    }
  }

  // Utility Methods
  isInTargetArea(position, area) {
    return position.x >= area.x1 && position.x <= area.x2 &&
      position.y >= area.y1 && position.y <= area.y2;
  }

  getQuestProgress(questId) {
    return this.activeQuests.get(questId);
  }

  isQuestActive(questId) {
    return this.activeQuests.has(questId);
  }

  isQuestCompleted(questId) {
    return this.completedQuests.has(questId);
  }

  getAvailableQuests(entity) {
    return Array.from(this.quests.values())
      .filter(quest => this.canStartQuest(quest.id, entity));
  }

  cleanup() {
    // Remove all event listeners
    this.questTriggers.forEach(triggerId => {
      const [questId, objectiveId] = triggerId.split('_');
      const quest = this.quests.get(questId);
      if (quest) {
        const objective = quest.objectives.find(obj => obj.id === objectiveId);
        if (objective) {
          this.deactivateObjectiveTrigger(questId, objective);
        }
      }
    });

    // Clear all quest data
    this.quests.clear();
    this.activeQuests.clear();
    this.completedQuests.clear();
    this.questChains.clear();
    this.questListeners.clear();
    this.questTriggers.clear();
  }
}

// Quest Progress Tracking
class QuestProgress {
  constructor(quest) {
    this.questId = quest.id;
    this.startTime = Date.now();
    this.objectives = new Map();

    // Initialize objective progress
    quest.objectives.forEach(objective => {
      this.objectives.set(objective.id, {
        current: 0,
        required: objective.required || 1,
        completed: false
      });
    });
  }

  incrementObjective(objectiveId, amount = 1) {
    const objective = this.objectives.get(objectiveId);
    if (!objective || objective.completed) return;

    objective.current = Math.min(
      objective.current + amount,
      objective.required
    );

    objective.completed = objective.current >= objective.required;
  }

  completeObjective(objectiveId) {
    const objective = this.objectives.get(objectiveId);
    if (!objective) return;

    objective.current = objective.required;
    objective.completed = true;
  }

  isObjectiveComplete(objectiveId) {
    const objective = this.objectives.get(objectiveId);
    return objective ? objective.completed : false;
  }

  getObjectiveProgress(objectiveId) {
    return this.objectives.get(objectiveId);
  }
}
