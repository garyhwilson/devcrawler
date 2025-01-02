// src/game/quests/index.js

export const QuestType = {
  MAIN: 'main',
  SIDE: 'side',
  DAILY: 'daily',
  EVENT: 'event'
};

export class Quest {
  constructor(config) {
    this.id = config.id;
    this.type = config.type || QuestType.SIDE;
    this.title = config.title;
    this.description = config.description;
    this.objectives = config.objectives;
    this.rewards = config.rewards;
    this.prerequisites = config.prerequisites;
    this.chainId = config.chainId;
    this.level = config.level || 1;
    this.timeLimit = config.timeLimit;
    this.repeatable = config.repeatable || false;
    this.faction = config.faction;
    this.dialogues = config.dialogues || {};
  }
}

// Quest Templates
export const QuestTemplates = {
  // Main Story Quests
  DUNGEON_ENTRANCE: {
    id: 'quest_main_dungeon_entrance',
    type: QuestType.MAIN,
    title: 'The Dungeon Beckons',
    type: QuestType.MAIN,
    description: 'Investigate the mysterious dungeon that has appeared on the outskirts of town.',
    level: 1,
    chainId: 'main_story',
    objectives: [
      {
        id: 'find_entrance',
        type: 'explore',
        description: 'Find the dungeon entrance',
        area: { x1: 0, y1: 0, x2: 10, y2: 10 }
      },
      {
        id: 'clear_entrance',
        type: 'kill',
        description: 'Clear the entrance of monsters',
        targetType: 'goblin',
        required: 3
      },
      {
        id: 'talk_to_guard',
        type: 'interact',
        description: 'Speak with the guard captain',
        targetId: 'npc_guard_captain'
      }
    ],
    rewards: {
      experience: 100,
      gold: 50,
      items: [
        { id: 'basic_health_potion', amount: 2 },
        { id: 'torch', amount: 1 }
      ]
    },
    dialogues: {
      start: {
        npcId: 'npc_guard_captain',
        text: "There's been strange activity near the old ruins. We need someone to investigate.",
        options: [
          { text: "I'll help investigate", action: 'ACCEPT_QUEST' },
          { text: "Not interested", action: 'DECLINE_QUEST' }
        ]
      },
      complete: {
        npcId: 'npc_guard_captain',
        text: "Good work clearing those monsters. This is more serious than we thought.",
        options: [
          { text: "What's our next move?", action: 'COMPLETE_QUEST' }
        ]
      }
    }
  },

  FIRST_DESCENT: {
    id: 'quest_main_first_descent',
    type: QuestType.MAIN,
    title: 'The First Descent',
    description: 'Make your first exploration into the dungeon depths.',
    level: 2,
    chainId: 'main_story',
    prerequisites: {
      quests: ['quest_main_dungeon_entrance'],
      level: 2
    },
    objectives: [
      {
        id: 'reach_first_level',
        type: 'explore',
        description: 'Reach the first level of the dungeon',
        area: { x1: 20, y1: 20, x2: 30, y2: 30 }
      },
      {
        id: 'find_artifact',
        type: 'collect',
        description: 'Find the ancient artifact',
        itemType: 'ancient_artifact',
        required: 1
      },
      {
        id: 'defeat_guardian',
        type: 'kill',
        description: 'Defeat the guardian',
        targetType: 'dungeon_guardian',
        required: 1
      }
    ],
    rewards: {
      experience: 200,
      gold: 100,
      items: [
        { id: 'magical_weapon', amount: 1 },
        { id: 'health_potion', amount: 3 }
      ],
      reputation: {
        'town_guard': 100
      }
    }
  },

  // Side Quests
  LOST_SUPPLIES: {
    id: 'quest_side_lost_supplies',
    type: QuestType.SIDE,
    title: 'Lost Supplies',
    description: 'Recover the merchant\'s lost supplies from the dungeon.',
    level: 1,
    objectives: [
      {
        id: 'find_supplies',
        type: 'collect',
        description: 'Find supply crates',
        itemType: 'supply_crate',
        required: 3
      },
      {
        id: 'clear_path',
        type: 'kill',
        description: 'Clear monsters blocking the path',
        targetType: 'goblin',
        required: 5
      }
    ],
    rewards: {
      experience: 75,
      gold: 50,
      reputation: {
        'merchant_guild': 50
      }
    }
  },

  RESCUE_MISSION: {
    id: 'quest_side_rescue',
    type: QuestType.SIDE,
    title: 'Rescue Mission',
    description: 'Save the trapped miner from the dungeon.',
    level: 2,
    objectives: [
      {
        id: 'find_miner',
        type: 'interact',
        description: 'Find the trapped miner',
        targetId: 'npc_trapped_miner'
      },
      {
        id: 'escort_miner',
        type: 'escort',
        description: 'Escort the miner to safety',
        npcId: 'npc_trapped_miner',
        destination: { x1: 0, y1: 0, x2: 5, y2: 5 }
      }
    ],
    rewards: {
      experience: 150,
      gold: 100,
      items: [
        { id: 'mining_map', amount: 1 }
      ]
    }
  },

  MYSTERIOUS_RUNES: {
    id: 'quest_side_runes',
    type: QuestType.SIDE,
    title: 'Mysterious Runes',
    description: 'Study the ancient runes found in the dungeon.',
    level: 3,
    prerequisites: {
      skills: [
        { id: 'arcane_knowledge', level: 2 }
      ]
    },
    objectives: [
      {
        id: 'find_runes',
        type: 'explore',
        description: 'Discover all rune locations',
        area: { x1: 10, y1: 10, x2: 40, y2: 40 },
        required: 4
      },
      {
        id: 'collect_rubbings',
        type: 'collect',
        description: 'Collect rune rubbings',
        itemType: 'rune_rubbing',
        required: 4
      }
    ],
    rewards: {
      experience: 200,
      items: [
        { id: 'spell_scroll', amount: 1 },
        { id: 'magic_essence', amount: 3 }
      ],
      skills: [
        { id: 'arcane_knowledge', points: 1 }
      ]
    }
  },

  // Daily Quests
  MONSTER_HUNT: {
    id: 'quest_daily_monster_hunt',
    type: QuestType.DAILY,
    title: 'Daily Monster Hunt',
    description: 'Clear out a number of monsters from the dungeon.',
    level: 1,
    repeatable: true,
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    objectives: [
      {
        id: 'kill_monsters',
        type: 'kill',
        description: 'Defeat monsters',
        targetType: ['goblin', 'skeleton', 'slime'],
        required: 10
      }
    ],
    rewards: {
      experience: 50,
      gold: 25,
      items: [
        { id: 'random_potion', amount: 1 }
      ]
    }
  },

  RESOURCE_GATHERING: {
    id: 'quest_daily_resources',
    type: QuestType.DAILY,
    title: 'Daily Resource Gathering',
    description: 'Gather resources from the dungeon.',
    level: 1,
    repeatable: true,
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    objectives: [
      {
        id: 'gather_resources',
        type: 'collect',
        description: 'Gather resources',
        itemType: ['ore', 'herbs', 'crystals'],
        required: 5
      }
    ],
    rewards: {
      experience: 40,
      gold: 20,
      reputation: {
        'merchant_guild': 10
      }
    }
  },

  // Event Quests
  GOBLIN_INVASION: {
    id: 'quest_event_goblin_invasion',
    type: QuestType.EVENT,
    title: 'Goblin Invasion',
    description: 'Help defend against a sudden goblin invasion!',
    level: 5,
    timeLimit: 60 * 60 * 1000, // 1 hour
    objectives: [
      {
        id: 'defend_entrance',
        type: 'defend',
        description: 'Defend the dungeon entrance',
        locationId: 'dungeon_entrance',
        requiredTime: 300, // 5 minutes
      },
      {
        id: 'defeat_goblins',
        type: 'kill',
        description: 'Defeat goblin invaders',
        targetType: 'goblin_invader',
        required: 20
      },
      {
        id: 'defeat_boss',
        type: 'kill',
        description: 'Defeat the goblin warlord',
        targetType: 'goblin_warlord',
        required: 1
      }
    ],
    rewards: {
      experience: 500,
      gold: 250,
      items: [
        { id: 'rare_weapon', amount: 1 },
        { id: 'invasion_trophy', amount: 1 }
      ],
      reputation: {
        'town_guard': 200,
        'merchant_guild': 100
      }
    }
  }
};

// Factory function to create quest instances
export function createQuest(templateId, customConfig = {}) {
  const template = QuestTemplates[templateId];
  if (!template) {
    throw new Error(`Quest template not found: ${templateId}`);
  }

  return new Quest({
    ...template,
    ...customConfig
  });
}

// Quest Chain Definitions
export const QuestChains = {
  main_story: [
    'quest_main_dungeon_entrance',
    'quest_main_first_descent',
    // Add more main story quests as they're developed
  ]
};
