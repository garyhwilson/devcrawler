import React, { useState, useEffect } from 'react'
import { ItemQuality } from '../items/ItemDatabase'

const InventoryUI = ({
  inventory,
  equipment,
  onItemUse,
  onItemDrop,
  onItemEquip,
  onItemUnequip
}) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [hoverItem, setHoverItem] = useState(null)
  const [draggedItem, setDraggedItem] = useState(null)
  const [contextMenuPos, setContextMenuPos] = useState(null)

  // Get quality color for items
  const getQualityColor = (quality) => {
    switch (quality) {
      case ItemQuality.LEGENDARY: return 'text-orange-400'
      case ItemQuality.EPIC: return 'text-purple-400'
      case ItemQuality.RARE: return 'text-blue-400'
      case ItemQuality.UNCOMMON: return 'text-green-400'
      case ItemQuality.POOR: return 'text-gray-400'
      default: return 'text-white'
    }
  }

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.setData('text/plain', item.instanceId)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  // Handle drag over for drop zones
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Handle item drop
  const handleDrop = (e, targetSlot) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')

    if (draggedItem && targetSlot) {
      if (targetSlot.type === 'equipment') {
        onItemEquip(draggedItem, targetSlot.slot)
      } else {
        // Handle inventory grid drops
        onItemUnequip(draggedItem)
      }
    }
  }

  // Handle context menu
  const handleContextMenu = (e, item) => {
    e.preventDefault()
    setSelectedItem(item)
    setContextMenuPos({ x: e.clientX, y: e.clientY })
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPos(null)
      setSelectedItem(null)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="flex gap-4 bg-gray-900 p-4 rounded-lg">
      {/* Equipment slots */}
      <div className="w-48 flex flex-col gap-2">
        <h2 className="text-white text-lg font-bold mb-2">Equipment</h2>
        <div className="grid grid-cols-2 gap-2">
          {['HEAD', 'NECK', 'SHOULDERS', 'CHEST', 'BACK',
            'WRISTS', 'HANDS', 'WAIST', 'LEGS', 'FEET',
            'MAIN_HAND', 'OFF_HAND', 'RING1', 'RING2',
            'TRINKET1', 'TRINKET2'].map(slot => (
              <div
                key={slot}
                className="w-16 h-16 bg-gray-800 border border-gray-700 rounded"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, { type: 'equipment', slot })}
              >
                {equipment[slot] && (
                  <div
                    draggable
                    className="w-full h-full relative"
                    onDragStart={(e) => handleDragStart(e, equipment[slot])}
                    onDragEnd={handleDragEnd}
                    onContextMenu={(e) => handleContextMenu(e, equipment[slot])}
                    onMouseEnter={() => setHoverItem(equipment[slot])}
                    onMouseLeave={() => setHoverItem(null)}
                  >
                    <img
                      src={equipment[slot].icon}
                      alt={equipment[slot].name}
                      className="w-full h-full object-contain"
                    />
                    {equipment[slot].durability && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${(equipment[slot].durability.current /
                              equipment[slot].durability.max) * 100}%`
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-gray-500 text-center mt-1">
                  {slot.replace('_', ' ')}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Inventory grid */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white text-lg font-bold">Inventory</h2>
          <div className="text-yellow-400">
            Gold: {inventory.gold}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: inventory.maxSize }).map((_, index) => (
            <div
              key={index}
              className="w-16 h-16 bg-gray-800 border border-gray-700 rounded"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, { type: 'inventory', index })}
            >
              {inventory.items[index] && (
                <div
                  draggable
                  className="w-full h-full relative"
                  onDragStart={(e) => handleDragStart(e, inventory.items[index])}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, inventory.items[index])}
                  onMouseEnter={() => setHoverItem(inventory.items[index])}
                  onMouseLeave={() => setHoverItem(null)}
                >
                  <img
                    src={inventory.items[index].icon}
                    alt={inventory.items[index].name}
                    className="w-full h-full object-contain"
                  />
                  {inventory.items[index].quantity > 1 && (
                    <div className="absolute bottom-1 right-1 bg-gray-900 rounded px-1 text-xs">
                      {inventory.items[index].quantity}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Item tooltip */}
      {hoverItem && (
        <div
          className="fixed bg-gray-900 border border-gray-700 p-2 rounded shadow-lg z-50 max-w-xs"
          style={{
            left: contextMenuPos?.x || 0,
            top: contextMenuPos?.y || 0
          }}
        >
          <div className={`font-bold ${getQualityColor(hoverItem.quality)}`}>
            {hoverItem.name}
          </div>
          <div className="text-gray-400 text-sm">{hoverItem.type}</div>
          <div className="text-white text-sm mt-1">{hoverItem.description}</div>
          {hoverItem.requirements && (
            <div className="mt-2">
              <div className="text-red-400 text-sm">Requirements:</div>
              {hoverItem.requirements.level && (
                <div className="text-sm">Level {hoverItem.requirements.level}</div>
              )}
              {hoverItem.requirements.stats && Object.entries(hoverItem.requirements.stats).map(([stat, value]) => (
                <div key={stat} className="text-sm">
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
                </div>
              ))}
            </div>
          )}
          {hoverItem.effects && hoverItem.effects.length > 0 && (
            <div className="mt-2">
              <div className="text-blue-400 text-sm">Effects:</div>
              {hoverItem.effects.map((effect, index) => (
                <div key={index} className="text-sm">
                  {effect.type === 'COMBAT_MODIFIER' &&
                    `${effect.value > 0 ? '+' : ''}${effect.value} ${effect.stat}`}
                  {effect.type === 'STAT_MODIFIER' &&
                    `${effect.value > 0 ? '+' : ''}${effect.value} ${effect.stat}`}
                  {effect.type === 'SKILL_MODIFIER' &&
                    `${effect.value > 0 ? '+' : ''}${effect.value} ${effect.skill}`}
                </div>
              ))}
            </div>
          )}
          <div className="text-gray-400 text-sm mt-2">
            Value: {hoverItem.value} gold
          </div>
        </div>
      )}

      {/* Context menu */}
      {contextMenuPos && selectedItem && (
        <div
          className="fixed bg-gray-900 border border-gray-700 rounded shadow-lg z-50"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          {selectedItem.canUse && (
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                onItemUse(selectedItem)
                setContextMenuPos(null)
              }}
            >
              Use
            </button>
          )}
          {selectedItem.slots && (
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-800"
              onClick={() => {
                onItemEquip(selectedItem)
                setContextMenuPos(null)
              }}
            >
              Equip
            </button>
          )}
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-800"
            onClick={() => {
              onItemDrop(selectedItem)
              setContextMenuPos(null)
            }}
          >
            Drop
          </button>
        </div>
      )}
    </div>
  )
}

export default InventoryUI
