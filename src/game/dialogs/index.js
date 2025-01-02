// src/game/dialogs/index.js

export const DialogueDatabase = {
  // Guard Captain's Dialog Tree
  guard_captain_intro: {
    startNode: 'greeting',
    nodes: {
      greeting: {
        text: "Welcome, adventurer. The town's been having some trouble with that dungeon to the north.",
        speaker: 'Captain Halworth',
        emotion: 'concerned',
        choices: [
          {
            text: "Tell me about the dungeon",
            nextNode: 'dungeon_info'
          },
          {
            text: "Any work available?",
            nextNode: 'quest_check'
          },
          {
            text: "Goodbye",
            nextNode: null
          }
        ]
      },
      dungeon_info: {
        text: "It appeared about a month ago. At first, we thought it was just another ruin, but then the monsters started coming out...",
        speaker: 'Captain Halworth',
        emotion: 'serious',
        choices: [
          {
            text: "Monsters?",
            nextNode: 'monster_info'
          },
          {
            text: "I can help",
            nextNode: 'quest_check'
          }
        ]
      },
      monster_info: {
        text: "Goblins mostly, but there have been reports of worse things in the deeper levels. We've lost good men trying to clear it out.",
        speaker: 'Captain Halworth',
        emotion: 'grim',
        choices: [
          {
            text: "I'm interested in helping",
            nextNode: 'quest_check'
          },
          {
            text: "I should go",
            nextNode: 'goodbye'
          }
        ]
      },
      quest_check: {
        text: (context) => {
          if (context.hasActiveQuest) {
            return "How's your current task going?";
          } else if (context.hasCompletedMainQuest) {
            return "Thanks for your help earlier. There's always more work if you're interested.";
          } else {
            return "We could use someone with your skills. Are you up for some dangerous work?";
          }
        },
        speaker: 'Captain Halworth',
        choices: [
          {
            text: "What needs to be done?",
            nextNode: 'quest_offer',
            condition: (context) => !context.hasActiveQuest
          },
          {
            text: "Still working on it",
            nextNode: 'quest_reminder',
            condition: (context) => context.hasActiveQuest
          },
          {
            text: "Maybe later",
            nextNode: 'goodbye'
          }
        ]
      },
      quest_offer: {
        text: "We need someone to scout the dungeon entrance and clear out any immediate threats. Think you can handle it?",
        speaker: 'Captain Halworth',
        emotion: 'neutral',
        choices: [
          {
            text: "I'll do it",
            nextNode: 'quest_accept',
            action: { type: 'START_QUEST', questId: 'quest_main_dungeon_entrance' }
          },
          {
            text: "What's the pay?",
            nextNode: 'quest_rewards'
          },
          {
            text: "Not interested",
            nextNode: 'quest_decline'
          }
        ]
      },
      quest_rewards: {
        text: "The town council has authorized payment of 50 gold pieces, plus you can keep anything you find. We'll also supply you with some basic equipment.",
        speaker: 'Captain Halworth',
        choices: [
          {
            text: "Sounds good",
            nextNode: 'quest_accept',
            action: { type: 'START_QUEST', questId: 'quest_main_dungeon_entrance' }
          },
          {
            text: "Not worth it",
            nextNode: 'quest_decline'
          }
        ]
      },
      quest_accept: {
        text: "Good. Start by checking the perimeter. Report back if you find anything unusual.",
        speaker: 'Captain Halworth',
        emotion: 'pleased',
        choices: [
          {
            text: "I'll get started",
            nextNode: null,
            action: {
              type: 'GIVE_ITEM',
              items: [
                { id: 'torch', amount: 2 },
                { id: 'health_potion', amount: 1 }
              ]
            }
          }
        ]
      },
      quest_decline: {
        text: "Suit yourself. The offer stands if you change your mind.",
        speaker: 'Captain Halworth',
        emotion: 'disappointed',
        choices: [
          {
            text: "Goodbye",
            nextNode: null
          }
        ]
      },
      quest_reminder: {
        text: "Remember, we need that entrance secured. Be thorough but careful.",
        speaker: 'Captain Halworth',
        choices: [
          {
            text: "I'm on it",
            nextNode: null
          },
          {
            text: "What was I doing again?",
            nextNode: 'quest_restate'
          }
        ]
      },
      quest_restate: {
        text: "Scout the dungeon entrance and clear out any monsters you find. Simple enough?",
        speaker: 'Captain Halworth',
        emotion: 'stern',
        choices: [
          {
            text: "Got it now",
            nextNode: null
          }
        ]
      },
      goodbye: {
        text: "Stay safe out there.",
        speaker: 'Captain Halworth',
        choices: [
          {
            text: "Goodbye",
            nextNode: null
          }
        ]
      }
    }
  },

  // Merchant's Dialog Tree
  merchant_dialog: {
    startNode: 'greeting',
    nodes: {
      greeting: {
        text: (context) => {
          if (context.reputation && context.reputation.merchant_guild > 50) {
            return "Ah, my favorite customer! What can I get for you today?";
          }
          return "Welcome to my humble shop. How can I help you?";
        },
        speaker: 'Merchant Giles',
        emotion: 'happy',
        choices: [
          {
            text: "Show me your wares",
            nextNode: 'shop',
            action: { type: 'OPEN_SHOP' }
          },
          {
            text: "I have items to sell",
            nextNode: 'sell',
            action: { type: 'OPEN_SELL_MENU' }
          },
          {
            text: "What's new in stock?",
            nextNode: 'new_items'
          },
          {
            text: "About those supplies...",
            nextNode: 'supplies_quest',
            condition: (context) => context.hasActiveQuest && context.activeQuestId === 'quest_side_lost_supplies'
          },
          {
            text: "Goodbye",
            nextNode: 'goodbye'
          }
        ]
      },
      shop: {
        text: "Take your time looking around. Everything is clearly priced.",
        speaker: 'Merchant Giles',
        choices: [
          {
            text: "I'm done shopping",
            nextNode: 'goodbye',
            action: { type: 'CLOSE_SHOP' }
          }
        ]
      },
      sell: {
        text: "Let's see what you've got. I pay fair prices for quality goods.",
        speaker: 'Merchant Giles',
        choices: [
          {
            text: "Done selling",
            nextNode: 'goodbye',
            action: { type: 'CLOSE_SELL_MENU' }
          }
        ]
      },
      new_items: {
        text: (context) => {
          const newItems = context.newInventoryItems || [];
          if (newItems.length > 0) {
            return "Just got in a fresh shipment! Some very interesting items you might like.";
          }
          return "Nothing new since your last visit, but my regular stock is still available.";
        },
        speaker: 'Merchant Giles',
        choices: [
          {
            text: "Let me see",
            nextNode: 'shop',
            action: { type: 'OPEN_SHOP' }
          },
          {
            text: "Maybe later",
            nextNode: 'goodbye'
          }
        ]
      },
      supplies_quest: {
        text: (context) => {
          if (context.questComplete) {
            return "You found my supplies! Excellent work! Here's your payment as promised.";
          }
          return "Any luck finding those supply crates? They're marked with my seal - you can't miss them.";
        },
        speaker: 'Merchant Giles',
        emotion: (context) => context.questComplete ? 'happy' : 'worried',
        choices: [
          {
            text: "Here are your supplies",
            nextNode: 'complete_supplies_quest',
            condition: (context) => context.hasRequiredItems,
            action: { type: 'COMPLETE_QUEST', questId: 'quest_side_lost_supplies' }
          },
          {
            text: "Still looking",
            nextNode: 'goodbye',
            condition: (context) => !context.questComplete
          },
          {
            text: "You're welcome",
            nextNode: 'goodbye',
            condition: (context) => context.questComplete
          }
        ]
      },
      complete_supplies_quest: {
        text: "This means a lot to me. Please, take this as a token of my gratitude. And remember, I always offer better prices to friends of the guild.",
        speaker: 'Merchant Giles',
        emotion: 'grateful',
        choices: [
          {
            text: "Thank you",
            nextNode: 'goodbye',
            action: [
              { type: 'MODIFY_REPUTATION', factionId: 'merchant_guild', amount: 50 },
              { type: 'GIVE_GOLD', amount: 50 }
            ]
          }
        ]
      },
      goodbye: {
        text: (context) => {
          if (context.reputation && context.reputation.merchant_guild > 75) {
            return "Always a pleasure doing business with you, friend!";
          }
          return "Thank you for your business. Come again!";
        },
        speaker: 'Merchant Giles',
        choices: [
          {
            text: "Goodbye",
            nextNode: null
          }
        ]
      }
    }
  },

  // Mysterious Wizard's Dialog Tree
  wizard_dialog: {
    startNode: 'greeting',
    nodes: {
      greeting: {
        text: (context) => {
          if (context.metBefore) {
            return "Ah, the adventurer returns. Have you found anything... interesting in your explorations?";
          }
          return "Well, well... Another brave soul ventures into these depths. Or perhaps... not so brave?";
        },
        speaker: 'Mysterious Wizard',
        emotion: 'intrigued',
        choices: [
          {
            text: "Who are you?",
            nextNode: 'introduction',
            condition: (context) => !context.metBefore
          },
          {
            text: "What are you doing here?",
            nextNode: 'purpose'
          },
          {
            text: "About those runes...",
            nextNode: 'runes_quest',
            condition: (context) => context.hasActiveQuest && context.activeQuestId === 'quest_side_runes'
          },
          {
            text: "I should go",
            nextNode: 'goodbye'
          }
        ]
      },
      introduction: {
        text: "Names have power, young seeker. Let's just say I'm a... student of the ancient mysteries. Much like yourself, I suspect.",
        speaker: 'Mysterious Wizard',
        emotion: 'mysterious',
        choices: [
          {
            text: "Tell me about these mysteries",
            nextNode: 'mysteries',
            action: { type: 'SET_FLAG', flag: 'metBefore', value: true }
          },
          {
            text: "I'm just here to explore",
            nextNode: 'purpose'
          }
        ]
      },
      mysteries: {
        text: "These walls hold secrets older than the kingdom itself. Ancient runes of power, waiting to be discovered...",
        speaker: 'Mysterious Wizard',
        emotion: 'excited',
        choices: [
          {
            text: "I'm interested in these runes",
            nextNode: 'offer_runes_quest',
            condition: (context) => !context.hasCompletedQuest('quest_side_runes')
          },
          {
            text: "Sounds dangerous",
            nextNode: 'warning'
          }
        ]
      },
      purpose: {
        text: "I study what others fear to understand. The dungeon's mysteries run deeper than most suspect.",
        speaker: 'Mysterious Wizard',
        choices: [
          {
            text: "Tell me more",
            nextNode: 'mysteries'
          },
          {
            text: "I'll leave you to it",
            nextNode: 'goodbye'
          }
        ]
      },
      warning: {
        text: "Indeed. Knowledge is power, but power always comes with a price. Remember that as you delve deeper.",
        speaker: 'Mysterious Wizard',
        emotion: 'serious',
        choices: [
          {
            text: "I'll be careful",
            nextNode: 'goodbye'
          }
        ]
      },
      offer_runes_quest: {
        text: "If you're truly interested, I could use an assistant in my research. The runes must be studied in their original locations.",
        speaker: 'Mysterious Wizard',
        emotion: 'thoughtful',
        choices: [
          {
            text: "I'll help",
            nextNode: 'accept_runes_quest',
            action: { type: 'START_QUEST', questId: 'quest_side_runes' }
          },
          {
            text: "Not interested",
            nextNode: 'goodbye'
          }
        ]
      },
      accept_runes_quest: {
        text: "Excellent! You'll need these runic papers to make proper copies. Find the runes, make rubbings of each, and return them to me.",
        speaker: 'Mysterious Wizard',
        emotion: 'pleased',
        choices: [
          {
            text: "I'll start looking",
            nextNode: null,
            action: { type: 'GIVE_ITEM', itemId: 'runic_paper', amount: 4 }
          }
        ]
      },
      runes_quest: {
        text: (context) => {
          if (context.hasAllRubbings) {
            return "Ah! You have all the rubbings! Let me see them...";
          }
          return "Have you found all the runes yet? Remember, we need complete rubbings of each one.";
        },
        speaker: 'Mysterious Wizard',
        emotion: (context) => context.hasAllRubbings ? 'excited' : 'neutral',
        choices: [
          {
            text: "Here are the rubbings",
            nextNode: 'complete_runes_quest',
            condition: (context) => context.hasAllRubbings,
            action: { type: 'COMPLETE_QUEST', questId: 'quest_side_runes' }
          },
          {
            text: "Still searching",
            nextNode: 'goodbye',
            condition: (context) => !context.hasAllRubbings
          }
        ]
      },
      complete_runes_quest: {
        text: "Yes, yes! These are perfect! Here, take this scroll - one of my earlier translations. It may prove useful in your adventures.",
        speaker: 'Mysterious Wizard',
        emotion: 'pleased',
        choices: [
          {
            text: "Thank you",
            nextNode: 'post_quest',
            action: { type: 'GIVE_ITEM', itemId: 'ancient_scroll', amount: 1 }
          }
        ]
      },
      post_quest: {
        text: "There are more mysteries in this dungeon, seeker. Return to me if you wish to delve deeper into the ancient knowledge.",
        speaker: 'Mysterious Wizard',
        emotion: 'mysterious',
        choices: [
          {
            text: "I will",
            nextNode: 'goodbye'
          }
        ]
      },
      goodbye: {
        text: "May the ancient wisdom guide your path... or at least keep you alive.",
        speaker: 'Mysterious Wizard',
        emotion: 'amused',
        choices: [
          {
            text: "Farewell",
            nextNode: null
          }
        ]
      }
    }
  }
};
