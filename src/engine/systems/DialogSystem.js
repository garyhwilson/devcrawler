// src/game/systems/DialogSystem.js

export class DialogSystem {
  constructor(world) {
    this.world = world;
    this.activeDialog = null;
    this.dialogStack = [];
    this.dialogueDatabase = new Map();
    this.conversationListeners = new Map();
    this.currentSpeaker = null;
    this.isDialogActive = false;
    this.dialogChoices = [];
    this.dialogHistory = [];
    this.maxHistoryLength = 50;
  }

  registerDialogue(dialogueId, dialogue) {
    this.dialogueDatabase.set(dialogueId, dialogue);
  }

  startDialog(npcId, dialogueId, context = {}) {
    const dialogue = this.dialogueDatabase.get(dialogueId);
    const npc = this.world.getEntityById(npcId);

    if (!dialogue || !npc) {
      console.warn(`Dialog not found: ${dialogueId} or NPC not found: ${npcId}`);
      return false;
    }

    // Save current dialog if one is active
    if (this.activeDialog) {
      this.dialogStack.push(this.activeDialog);
    }

    this.activeDialog = {
      npcId,
      dialogueId,
      currentNode: dialogue.startNode,
      context: { ...context },
      dialogue
    };

    this.currentSpeaker = npc;
    this.isDialogActive = true;

    // Process the first node
    this.processDialogNode(dialogue.startNode);

    // Emit dialog start event
    this.world.emit('dialogStarted', {
      npcId,
      dialogueId,
      context
    });

    return true;
  }

  processDialogNode(nodeId) {
    if (!this.activeDialog || !nodeId) return;

    const node = this.activeDialog.dialogue.nodes[nodeId];
    if (!node) return;

    // Process node actions
    if (node.onEnter) {
      node.onEnter(this.activeDialog.context);
    }

    // Get available choices
    this.dialogChoices = this.getAvailableChoices(node);

    // Add to history
    this.addToHistory({
      speaker: this.currentSpeaker?.name || 'Unknown',
      text: this.processText(node.text),
      choices: this.dialogChoices
    });

    // Emit node processed event
    this.world.emit('dialogNodeProcessed', {
      nodeId,
      text: this.processText(node.text),
      choices: this.dialogChoices
    });
  }

  selectChoice(choiceIndex) {
    if (!this.isDialogActive || !this.activeDialog) return false;

    const choice = this.dialogChoices[choiceIndex];
    if (!choice) return false;

    // Execute choice actions
    if (choice.action) {
      this.executeAction(choice.action);
    }

    // Process next node or end dialog
    if (choice.nextNode) {
      this.processDialogNode(choice.nextNode);
    } else {
      this.endDialog();
    }

    return true;
  }

  endDialog() {
    if (!this.activeDialog) return;

    // Process end actions
    const dialogue = this.activeDialog.dialogue;
    if (dialogue.onEnd) {
      dialogue.onEnd(this.activeDialog.context);
    }

    // Emit dialog end event
    this.world.emit('dialogEnded', {
      npcId: this.activeDialog.npcId,
      dialogueId: this.activeDialog.dialogueId
    });

    // Restore previous dialog if exists
    if (this.dialogStack.length > 0) {
      this.activeDialog = this.dialogStack.pop();
      this.processDialogNode(this.activeDialog.currentNode);
    } else {
      this.activeDialog = null;
      this.currentSpeaker = null;
      this.isDialogActive = false;
      this.dialogChoices = [];
    }
  }

  getAvailableChoices(node) {
    if (!node.choices) return [];

    return node.choices.filter(choice => {
      // Check conditions if they exist
      if (choice.condition) {
        return choice.condition(this.activeDialog.context);
      }
      return true;
    });
  }

  processText(text) {
    if (typeof text === 'function') {
      return text(this.activeDialog.context);
    }

    // Process any variables in the text
    return text.replace(/\{(\w+)\}/g, (match, variable) => {
      return this.activeDialog.context[variable] || match;
    });
  }

  executeAction(action) {
    if (typeof action === 'function') {
      action(this.activeDialog.context);
      return;
    }

    // Handle predefined actions
    switch (action.type) {
      case 'GIVE_ITEM':
        this.giveItem(action.itemId, action.amount);
        break;
      case 'START_QUEST':
        this.startQuest(action.questId);
        break;
      case 'COMPLETE_QUEST':
        this.completeQuest(action.questId);
        break;
      case 'MODIFY_REPUTATION':
        this.modifyReputation(action.factionId, action.amount);
        break;
      case 'UNLOCK_LOCATION':
        this.unlockLocation(action.locationId);
        break;
      case 'SET_FLAG':
        this.setFlag(action.flag, action.value);
        break;
      // Add more action types as needed
    }
  }

  giveItem(itemId, amount = 1) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    const inventory = player.getComponent('InventoryComponent');
    if (inventory) {
      inventory.addItem(itemId, amount);
    }
  }

  startQuest(questId) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    const questSystem = this.world.getSystem('QuestSystem');
    if (questSystem) {
      questSystem.startQuest(questId, player);
    }
  }

  completeQuest(questId) {
    const questSystem = this.world.getSystem('QuestSystem');
    if (questSystem) {
      questSystem.completeQuest(questId);
    }
  }

  modifyReputation(factionId, amount) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    const reputation = player.getComponent('ReputationComponent');
    if (reputation) {
      reputation.adjustFactionStanding(factionId, amount);
    }
  }

  unlockLocation(locationId) {
    const player = this.world.findEntityByTag('player');
    if (!player) return;

    const progress = player.getComponent('ProgressComponent');
    if (progress) {
      progress.unlockLocation(locationId);
    }
  }

  setFlag(flag, value) {
    if (this.activeDialog) {
      this.activeDialog.context[flag] = value;
    }
  }

  addToHistory(entry) {
    this.dialogHistory.push(entry);
    if (this.dialogHistory.length > this.maxHistoryLength) {
      this.dialogHistory.shift();
    }
  }

  getDialogHistory() {
    return this.dialogHistory;
  }

  isInDialog() {
    return this.isDialogActive;
  }

  getCurrentSpeaker() {
    return this.currentSpeaker;
  }

  getCurrentChoices() {
    return this.dialogChoices;
  }

  cleanup() {
    this.activeDialog = null;
    this.dialogStack = [];
    this.currentSpeaker = null;
    this.isDialogActive = false;
    this.dialogChoices = [];
    this.dialogHistory = [];
  }
}

// Dialog Node Types
export class DialogNode {
  constructor(config) {
    this.id = config.id;
    this.text = config.text;
    this.choices = config.choices || [];
    this.onEnter = config.onEnter;
    this.onExit = config.onExit;
    this.conditions = config.conditions;
    this.speaker = config.speaker;
    this.emotion = config.emotion;
    this.animation = config.animation;
  }
}

export class DialogChoice {
  constructor(config) {
    this.text = config.text;
    this.nextNode = config.nextNode;
    this.action = config.action;
    this.condition = config.condition;
    this.requiredFlags = config.requiredFlags;
    this.requiredItems = config.requiredItems;
    this.requiredQuests = config.requiredQuests;
  }
}

// Dialog Factory for creating common dialog patterns
export class DialogFactory {
  static createQuestDialog(quest) {
    return {
      startNode: 'intro',
      nodes: {
        intro: {
          text: quest.dialogues.start.text,
          choices: [
            {
              text: "Tell me more",
              nextNode: 'details'
            },
            {
              text: "Not interested",
              nextNode: 'reject'
            }
          ]
        },
        details: {
          text: quest.description,
          choices: [
            {
              text: "I'll help",
              nextNode: 'accept',
              action: { type: 'START_QUEST', questId: quest.id }
            },
            {
              text: "Maybe later",
              nextNode: 'reject'
            }
          ]
        },
        accept: {
          text: "Excellent! Return to me when you're done.",
          choices: [
            {
              text: "I'll get right on it",
              nextNode: null
            }
          ]
        },
        reject: {
          text: "Perhaps another time then.",
          choices: [
            {
              text: "Goodbye",
              nextNode: null
            }
          ]
        }
      }
    };
  }

  static createShopDialog(shopkeeper) {
    return {
      startNode: 'greeting',
      nodes: {
        greeting: {
          text: "Welcome! What can I do for you?",
          choices: [
            {
              text: "Show me your wares",
              nextNode: 'shop',
              action: { type: 'OPEN_SHOP' }
            },
            {
              text: "Tell me about your stock",
              nextNode: 'about'
            },
            {
              text: "Goodbye",
              nextNode: null
            }
          ]
        },
        shop: {
          text: "Take a look at my inventory.",
          choices: [
            {
              text: "Done shopping",
              nextNode: 'goodbye'
            }
          ]
        },
        about: {
          text: shopkeeper.shopDescription,
          choices: [
            {
              text: "Let me see what you have",
              nextNode: 'shop',
              action: { type: 'OPEN_SHOP' }
            },
            {
              text: "Maybe later",
              nextNode: 'goodbye'
            }
          ]
        },
        goodbye: {
          text: "Come back soon!",
          choices: [
            {
              text: "Goodbye",
              nextNode: null
            }
          ]
        }
      }
    };
  }
}
