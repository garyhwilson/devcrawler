// src/game/ui/KeyBindingsHelp.jsx

import React from 'react'

const KeyBindingsHelp = ({ isVisible, onClose }) => {
  if (!isVisible) return null

  const keyBindings = [
    {
      category: 'Movement',
      bindings: [
        { key: '↑/W', action: 'Move Up' },
        { key: '↓/S', action: 'Move Down' },
        { key: '←/A', action: 'Move Left' },
        { key: '→/D', action: 'Move Right' }
      ]
    },
    {
      category: 'Combat',
      bindings: [
        { key: 'SPACE', action: 'Attack' },
        { key: 'Q', action: 'Use Quick Item 1' },
        { key: 'E', action: 'Use Quick Item 2' },
        { key: 'R', action: 'Use Quick Item 3' },
        { key: 'TAB', action: 'Target Next Enemy' }
      ]
    },
    {
      category: 'Interface',
      bindings: [
        { key: 'I', action: 'Toggle Inventory' },
        { key: 'C', action: 'Toggle Character Sheet' },
        { key: 'M', action: 'Toggle Map' },
        { key: 'J', action: 'Toggle Quest Log' },
        { key: 'ESC', action: 'Game Menu' }
      ]
    },
    {
      category: 'Interaction',
      bindings: [
        { key: 'F', action: 'Interact' },
        { key: 'Z', action: 'Pick Up Item' },
        { key: 'T', action: 'Talk to NPC' },
        { key: 'H', action: 'Toggle This Help' }
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Key Bindings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {keyBindings.map(category => (
            <div key={category.category} className="bg-gray-800 p-4 rounded">
              <h3 className="text-lg font-bold text-white mb-3">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.bindings.map(binding => (
                  <div
                    key={binding.key}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-300">
                      {binding.action}
                    </span>
                    <kbd className="px-2 py-1 bg-gray-700 rounded text-sm text-white">
                      {binding.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-gray-400 text-sm">
          <p>Press H at any time to toggle this help screen.</p>
          <p>Key bindings can be customized in the Settings menu.</p>
        </div>
      </div>
    </div>
  )
}

export default KeyBindingsHelp
