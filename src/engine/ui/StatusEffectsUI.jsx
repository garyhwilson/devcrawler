// src/game/ui/StatusEffectsUI.jsx

import React, { useState, useEffect } from 'react'

const StatusEffectsUI = ({
  effects,
  onEffectClick,  // For detailed view
  compact = false // For minimized view in HUD
}) => {
  const [selectedEffect, setSelectedEffect] = useState(null)
  const [timeLeft, setTimeLeft] = useState({})

  // Update remaining time for effects
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {}
      effects.forEach(effect => {
        newTimeLeft[effect.id] = Math.max(0, effect.duration - (Date.now() - effect.startTime))
      })
      setTimeLeft(newTimeLeft)
    }, 100)

    return () => clearInterval(timer)
  }, [effects])

  const getEffectTypeColor = (type) => {
    switch (type) {
      case 'BUFF': return 'bg-green-500'
      case 'DEBUFF': return 'bg-red-500'
      case 'POISON': return 'bg-purple-500'
      case 'MAGIC': return 'bg-blue-500'
      case 'CURSE': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDuration = (ms) => {
    if (ms === Infinity) return 'Permanent'
    const seconds = Math.ceil(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const renderEffectIcon = (effect) => (
    <div
      key={effect.id}
      className={`relative w-12 h-12 rounded ${selectedEffect?.id === effect.id ? 'ring-2 ring-white' : ''
        }`}
      onClick={() => {
        onEffectClick?.(effect)
        setSelectedEffect(effect)
      }}
    >
      {/* Effect Icon */}
      <div className={`w-full h-full rounded ${getEffectTypeColor(effect.type)} 
                           flex items-center justify-center cursor-pointer relative overflow-hidden`}>
        <img
          src={effect.icon}
          alt={effect.name}
          className="w-8 h-8"
        />

        {/* Duration indicator (circular) */}
        {effect.duration !== Infinity && (
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${(timeLeft[effect.id] / effect.duration) * 138} 138`}
            />
          </svg>
        )}

        {/* Stack count if applicable */}
        {effect.stacks > 1 && (
          <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full w-5 h-5 
                                  flex items-center justify-center text-xs">
            {effect.stacks}
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute hidden group-hover:block z-10 w-48 p-2 bg-gray-900 
                          rounded shadow-lg -translate-x-1/2 left-1/2 top-full mt-1">
        <div className="text-white font-bold">{effect.name}</div>
        <div className="text-gray-300 text-sm">{effect.description}</div>
        <div className="text-gray-400 text-xs">
          {formatDuration(timeLeft[effect.id])}
        </div>
      </div>
    </div>
  )

  // Compact view for HUD
  if (compact) {
    return (
      <div className="fixed top-4 right-4 flex flex-wrap gap-1 max-w-[200px]">
        {effects.map(effect => renderEffectIcon(effect))}
      </div>
    )
  }

  // Full view for character screen
  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-white">Active Effects</h3>
      </div>

      <div className="flex gap-4">
        {/* Effects List */}
        <div className="flex-1">
          {effects.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              No active effects
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {effects.map(effect => renderEffectIcon(effect))}
            </div>
          )}
        </div>

        {/* Effect Details */}
        {selectedEffect && (
          <div className="w-64 bg-gray-800 p-4 rounded">
            <h4 className="text-lg font-bold text-white mb-2">
              {selectedEffect.name}
            </h4>
            <div className="text-gray-300 text-sm mb-4">
              {selectedEffect.description}
            </div>

            {/* Effect Modifiers */}
            {selectedEffect.modifiers && (
              <div className="mb-4">
                <div className="text-gray-400 font-bold mb-1">Effects:</div>
                {Object.entries(selectedEffect.modifiers).map(([stat, value]) => (
                  <div key={stat} className="text-sm flex justify-between">
                    <span className="text-gray-400">
                      {stat.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {value > 0 ? '+' : ''}{value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Duration */}
            <div className="text-gray-400 text-sm mb-2">
              Time Remaining: {formatDuration(timeLeft[selectedEffect.id])}
            </div>

            {/* Progress bar */}
            {selectedEffect.duration !== Infinity && (
              <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  className={`h-full ${getEffectTypeColor(selectedEffect.type)}`}
                  style={{
                    width: `${(timeLeft[selectedEffect.id] / selectedEffect.duration) * 100}%`
                  }}
                />
              </div>
            )}

            {/* Source */}
            {selectedEffect.source && (
              <div className="text-gray-500 text-xs mt-4">
                Source: {selectedEffect.source}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusEffectsUI

// Example effect data structure:
/*
{
    id: 'effect_1',
    name: 'Strength Potion',
    description: 'Increases physical damage',
    type: 'BUFF',
    icon: 'strength_potion_icon',
    duration: 30000, // 30 seconds in milliseconds
    startTime: Date.now(),
    stacks: 1,
    modifiers: {
        physicalDamage: 5,
        strengthBonus: 2
    },
    source: 'Greater Strength Potion'
}
*/
