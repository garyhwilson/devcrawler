// src/game/entities/EntityFactory.js

import {
  Entity,
  TransformComponent,
  SpriteComponent,
  CollisionComponent,
  VelocityComponent,
  StateMachineComponent
} from '../../engine/ecs';

import {
  StatsComponent,
  ProgressComponent,
  InventoryComponent,
  CombatComponent,
  DialogComponent,
  StatusEffectComponent,
  LootComponent,
  ItemComponent
} from '../components';

export class EntityFactory {
  constructor(world, assetManager) {
    this.world = world;
    this.assetManager = assetManager;
  }

  createPlayer(x, y) {
    const player = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite('player'),
        32,
        32
      ))
      .addComponent(new CollisionComponent(0.8, 0.8)) // Slightly smaller than tile
      .addComponent(new VelocityComponent())
      .addComponent(new StateMachineComponent())
      .addComponent(new StatsComponent({
        physicality: 12,
        mental: 10,
        social: 10
      }))
      .addComponent(new ProgressComponent())
      .addComponent(new InventoryComponent(20))
      .addComponent(new CombatComponent({
        attackRange: 1,
        baseDamage: 3,
        variableDamage: 3,
        maxHP: 20
      }))
      .addComponent(new StatusEffectComponent())
      .addTag('player');

    // Set up player animations
    const sprite = player.getComponent(SpriteComponent);
    sprite.addAnimation('idle', [0], 0);
    sprite.addAnimation('walk', [1, 2, 3, 4], 0.15);
    sprite.addAnimation('attack', [5, 6, 7], 0.1);
    sprite.playAnimation('idle');

    return player;
  }

  createMonster(type, x, y) {
    const monsterData = this.getMonsterData(type);

    const monster = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite(monsterData.sprite),
        32,
        32
      ))
      .addComponent(new CollisionComponent(0.8, 0.8))
      .addComponent(new VelocityComponent())
      .addComponent(new StateMachineComponent())
      .addComponent(new StatsComponent(monsterData.stats))
      .addComponent(new CombatComponent(monsterData.combat))
      .addComponent(new StatusEffectComponent())
      .addComponent(new LootComponent(monsterData.loot))
      .addComponent(new ProgressComponent({
        experienceValue: monsterData.experienceValue
      }))
      .addTag('monster')
      .addTag(type);

    // Set up monster animations
    const sprite = monster.getComponent(SpriteComponent);
    sprite.addAnimation('idle', [0], 0);
    sprite.addAnimation('walk', [1, 2, 3, 4], 0.15);
    sprite.addAnimation('attack', [5, 6, 7], 0.1);
    sprite.playAnimation('idle');

    return monster;
  }

  createItem(itemData, x, y) {
    const item = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite(itemData.sprite),
        32,
        32
      ))
      .addComponent(new ItemComponent(itemData))
      .addTag('item')
      .addTag(itemData.type);

    return item;
  }

  createGold(amount, x, y) {
    const gold = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite('gold'),
        32,
        32
      ))
      .addComponent(new ItemComponent({
        name: 'Gold',
        value: amount,
        type: 'currency'
      }))
      .addTag('item')
      .addTag('gold');

    return gold;
  }

  createNPC(type, x, y) {
    const npcData = this.getNPCData(type);

    const npc = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite(npcData.sprite),
        32,
        32
      ))
      .addComponent(new CollisionComponent(0.8, 0.8))
      .addComponent(new DialogComponent())
      .addTag('npc')
      .addTag(type);

    // Add dialogs
    const dialog = npc.getComponent(DialogComponent);
    npcData.dialogs.forEach(d => dialog.addDialog(d.id, d.content));

    return npc;
  }

  createDoor(x, y, type = 'normal') {
    const door = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite('door'),
        32,
        32
      ))
      .addComponent(new CollisionComponent(1, 1))
      .addTag('door')
      .addTag(type);

    // Set up door animations
    const sprite = door.getComponent(SpriteComponent);
    sprite.addAnimation('closed', [0], 0);
    sprite.addAnimation('open', [1], 0);
    sprite.playAnimation('closed');

    return door;
  }

  createChest(x, y, lootTable) {
    const chest = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite('chest'),
        32,
        32
      ))
      .addComponent(new CollisionComponent(1, 1))
      .addComponent(new LootComponent(lootTable))
      .addTag('chest');

    // Set up chest animations
    const sprite = chest.getComponent(SpriteComponent);
    sprite.addAnimation('closed', [0], 0);
    sprite.addAnimation('open', [1], 0);
    sprite.playAnimation('closed');

    return chest;
  }

  createEffect(type, x, y, duration = 1000) {
    const effect = new Entity()
      .addComponent(new TransformComponent(x, y))
      .addComponent(new SpriteComponent(
        this.assetManager.getSprite(type),
        32,
        32
      ))
      .addTag('effect');

    // Set up effect animation
    const sprite = effect.getComponent(SpriteComponent);
    sprite.addAnimation('play', [0, 1, 2, 3], duration / 4000);
    sprite.playAnimation('play', false);

    // Remove effect when animation completes
    setTimeout(() => {
      this.world.removeEntity(effect);
    }, duration);

    return effect;
  }

  getMonsterData(type) {
    // Monster configurations
    const monsters = {
      goblin: {
        sprite: 'goblin',
        stats: {
          physicality: 8,
          mental: 6,
          social: 4
        },
        combat: {
          attackRange: 1,
          baseDamage: 2,
          variableDamage: 2,
          maxHP: 8
        },
        loot: {
          minGold: 1,
          maxGold: 6,
          lootTable: [
            { item: 'dagger', chance: 0.2 },
            { item: 'leather_armor', chance: 0.1 }
          ]
        },
        experienceValue: 50
      },
      skeleton: {
        sprite: 'skeleton',
        stats: {
          physicality: 10,
          mental: 4,
          social: 2
        },
        combat: {
          attackRange: 1,
          baseDamage: 3,
          variableDamage: 3,
          maxHP: 12
        },
        loot: {
          minGold: 2,
          maxGold: 8,
          lootTable: [
            { item: 'bone_sword', chance: 0.15 },
            { item: 'shield', chance: 0.1 }
          ]
        },
        experienceValue: 75
      },
      orc: {
        sprite: 'orc',
        stats: {
          physicality: 14,
          mental: 6,
          social: 6
        },
        combat: {
          attackRange: 1,
          baseDamage: 4,
          variableDamage: 4,
          maxHP: 20
        },
        loot: {
          minGold: 5,
          maxGold: 15,
          lootTable: [
            { item: 'battle_axe', chance: 0.1 },
            { item: 'plate_armor', chance: 0.05 }
          ]
        },
        experienceValue: 100
      },
      boss: {
        sprite: 'boss',
        stats: {
          physicality: 18,
          mental: 12,
          social: 10
        },
        combat: {
          attackRange: 2,
          baseDamage: 6,
          variableDamage: 6,
          maxHP: 40
        },
        loot: {
          minGold: 50,
          maxGold: 100,
          guaranteedItems: ['magical_weapon'],
          lootTable: [
            { item: 'rare_armor', chance: 0.5 },
            { item: 'health_potion', chance: 1.0 }
          ]
        },
        experienceValue: 500
      }
    };

    return monsters[type] || monsters.goblin;
  }

  getNPCData(type) {
    // NPC configurations
    const npcs = {
      merchant: {
        sprite: 'merchant',
        dialogs: [
          {
            id: 'greeting',
            content: {
              startNode: 'start',
              nodes: {
                start: {
                  text: "Welcome! Care to browse my wares?",
                  options: [
                    {
                      text: "Show me what you have.",
                      nextNode: 'shop',
                      action: () => this.openShop()
                    },
                    {
                      text: "Not right now.",
                      nextNode: 'farewell'
                    }
                  ]
                },
                shop: {
                  text: "Take your time looking around.",
                  options: [
                    {
                      text: "Done shopping.",
                      nextNode: 'farewell'
                    }
                  ]
                },
                farewell: {
                  text: "Come back soon!",
                  options: []
                }
              }
            }
          }
        ],
        inventory: [
          { item: 'health_potion', price: 50 },
          { item: 'mana_potion', price: 50 },
          { item: 'basic_sword', price: 100 },
          { item: 'basic_shield', price: 75 }
        ]
      },
      questGiver: {
        sprite: 'questGiver',
        dialogs: [
          {
            id: 'quest',
            content: {
              startNode: 'start',
              nodes: {
                start: {
                  text: "Adventurer! I need your help!",
                  options: [
                    {
                      text: "What's the problem?",
                      nextNode: 'explain'
                    },
                    {
                      text: "Not interested.",
                      nextNode: 'farewell'
                    }
                  ]
                },
                explain: {
                  text: "Monsters have stolen my precious artifacts. Can you help recover them?",
                  options: [
                    {
                      text: "I'll help.",
                      nextNode: 'accept',
                      action: () => this.startQuest('artifact_recovery')
                    },
                    {
                      text: "Maybe later.",
                      nextNode: 'farewell'
                    }
                  ]
                },
                accept: {
                  text: "Thank you! Return to me when you've found them.",
                  options: []
                },
                farewell: {
                  text: "Perhaps another time then.",
                  options: []
                }
              }
            }
          }
        ]
      }
    };

    return npcs[type] || npcs.merchant;
  }

  getItemData(itemId) {
    // Item configurations
    const items = {
      health_potion: {
        name: "Health Potion",
        description: "Restores 20 HP",
        type: "consumable",
        sprite: "health_potion",
        value: 50,
        effect: {
          type: "heal",
          amount: 20
        }
      },
      mana_potion: {
        name: "Mana Potion",
        description: "Restores 20 MP",
        type: "consumable",
        sprite: "mana_potion",
        value: 50,
        effect: {
          type: "restore_mana",
          amount: 20
        }
      },
      basic_sword: {
        name: "Basic Sword",
        description: "A simple but effective weapon",
        type: "weapon",
        sprite: "basic_sword",
        value: 100,
        slot: "weapon",
        stats: {
          baseDamage: 5,
          variableDamage: 3
        },
        requirements: {
          physicality: 8
        }
      },
      basic_shield: {
        name: "Basic Shield",
        description: "Provides basic protection",
        type: "shield",
        sprite: "basic_shield",
        value: 75,
        slot: "offhand",
        stats: {
          armorBonus: 2
        },
        requirements: {
          physicality: 6
        }
      },
      leather_armor: {
        name: "Leather Armor",
        description: "Light armor made of leather",
        type: "armor",
        sprite: "leather_armor",
        value: 150,
        slot: "body",
        stats: {
          armorBonus: 3
        },
        requirements: {
          physicality: 5
        }
      },
      magical_weapon: {
        name: "Enchanted Blade",
        description: "A weapon imbued with magical power",
        type: "weapon",
        sprite: "magical_weapon",
        value: 500,
        slot: "weapon",
        stats: {
          baseDamage: 8,
          variableDamage: 4,
          magicDamage: 3
        },
        requirements: {
          physicality: 10,
          mental: 8
        }
      }
    };

    return items[itemId];
  }

  openShop() {
    const ui = this.world.findEntityByTag('ui');
    if (ui) {
      const uiComponent = ui.getComponent('UIComponent');
      if (uiComponent) {
        uiComponent.openShop();
      }
    }
  }

  startQuest(questId) {
    const player = this.world.findEntityByTag('player');
    if (player) {
      const questComponent = player.getComponent('QuestComponent');
      if (questComponent) {
        questComponent.startQuest(questId);
      }
    }
  }
}
