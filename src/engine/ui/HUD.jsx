// src/game/ui/HUD.jsx

import React from 'react'
import StatusEffectsUI from './StatusEffectsUI'

const HUD = ({
  player,
  statusEffects,
  minimap,
  notifications,
  activeQuests
}) => {
  const renderResourceBar = (current, max, color, backgroundColor = 'bg-gray-800') => (
    <div className={`w-full h-4 ${backgroundColor} rounded overflow-hidden`}>
      <div
        className={`h-full ${color} transition-all duration-200`}
        style={{ width: `${(current / max) * 100}%` }}
      />
    </div>
  )

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top-left: Character Stats */}
      <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-80 p-2 rounded pointer-events-auto">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-white">{player.name}</div>
          <div className="text-gray-400 text-sm">Level {player.level}</div>
        </div>

        {/* Health Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-red-400">Health</span>
            <span className="text-gray-400">
              {player.currentHP} / {player.maxHP}
            </span>
          </div>
          {renderResourceBar(player.currentHP, player.maxHP, 'bg-red-600')}
        </div>

        {/* Mana Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-400">Mana</span>
            <span className="text-gray-400">
              {player.currentMana} / {player.maxMana}
            </span>
          </div>
          {renderResourceBar(player.currentMana, player.maxMana, 'bg-blue-600')}
        </div>

        {/* Experience Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-400">Experience</span>
            <span className="text-gray-400">
              {player.experience} / {player.experienceToNext}
            </span>
          </div>
          {renderResourceBar(player.experience, player.experienceToNext, 'bg-purple-600')}
        </div>
      </div>

      {/* Top-right: Status Effects */}
      <StatusEffectsUI
        effects={statusEffects}
        compact={true}
      />

      {/* Bottom-left: Active Quests */}
      <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 p-2 rounded 
                          max-w-xs pointer-events-auto">
        <div className="text-white font-bold mb-2">Active Quests</div>
        {activeQuests.map(quest => (
          <div key={quest.id} className="mb-2">
            <div className="text-gray-300 text-sm">{quest.name}</div>
            <div className="text-gray-500 text-xs">{quest.currentObjective}</div>
            {quest.progress !== undefined && (
              <div className="w-full h-1 bg-gray-800 rounded mt-1">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: `${quest.progress * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom-right: Minimap */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        {minimap}
      </div>

      {/* Notifications */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 
                          flex flex-col items-center gap-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded text-white text-sm
                                  animate-fade-out pointer-events-auto
                                  ${notification.type === 'success' ? 'bg-green-600' :
                notification.type === 'error' ? 'bg-red-600' :
                  notification.type === 'warning' ? 'bg-yellow-600' :
                    'bg-gray-600'}`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Combat Feedback */}
      <div className="absolute inset-0 pointer-events-none">
        {player.combatFeedback.map(feedback => (
          <div
            key={feedback.id}
            className="absolute text-2xl font-bold"
            style={{
              left: feedback.x,
              top: feedback.y,
              color: feedback.type === 'damage' ? '#ff4444' :
                feedback.type === 'heal' ? '#44ff44' :
                  feedback.type === 'miss' ? '#ffffff' :
                    '#ffffff',
              animation: 'float-up 1s ease-out forwards',
              opacity: 0
            }}
          >
            {feedback.value}
          </div>
        ))}
      </div>

      {/* Key Bindings Help (toggle with H key) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                          bg-gray-900 bg-opacity-80 p-2 rounded text-xs text-gray-400">
        Press H to toggle help
      </div>
    </div>
  )
}

export default HUD

// Add to your global CSS:
/*
@keyframes float-up {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateY(-50px);
        opacity: 0;
    }
}

@keyframes fade-out {
    0% {
        opacity: 1;
        transform: translateY(0);
    }
    100% {
        opacity: 0;
        transform: translateY(-20px);
    }
}

.animate-fade-out {
    animation: fade-out 3s ease-out forwards;
}

.animate-float-up {
    animation: float-up 1s ease-out forwards;
}
*/
