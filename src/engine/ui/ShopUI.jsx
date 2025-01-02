import React, { useState } from 'react'
import { ItemQuality } from '../items/ItemDatabase'

const ShopUI = ({
  merchantInventory,
  playerInventory,
  reputation,
  onBuy,
  onSell,
  onClose
}) => {
  const [selectedTab, setSelectedTab] = useState('buy')
  const [selectedItem, setSelectedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)

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

  const getBuyPrice = (item) => {
    let price = item.value
    if (reputation) {
      price = Math.floor(price * reputation.getPriceMultiplier())
    }
    return price
  }

  const getSellPrice = (item) => {
    return Math.floor(item.value * 0.4) // Base sell value is 40% of buy price
  }

  const handleBuy = (item) => {
    const price = getBuyPrice(item) * quantity
    if (playerInventory.gold >= price) {
      onBuy(item, quantity)
      setSelectedItem(null)
      setQuantity(1)
    }
  }

  const handleSell = (item) => {
    onSell(item, quantity)
    setSelectedItem(null)
    setQuantity(1)
  }

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(value,
      selectedItem ? selectedItem.maxStack || 1 : 1))
    setQuantity(newQuantity)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Merchant</h2>
          <div className="flex items-center gap-4">
            <div className="text-yellow-400">
              Your Gold: {playerInventory.gold}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${selectedTab === 'buy'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
              }`}
            onClick={() => setSelectedTab('buy')}
          >
            Buy
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedTab === 'sell'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
              }`}
            onClick={() => setSelectedTab('sell')}
          >
            Sell
          </button>
        </div>

        <div className="flex gap-4">
          {/* Item grid */}
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-2">
              {selectedTab === 'buy' ? (
                // Merchant inventory
                merchantInventory.items.map((item, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 bg-gray-800 border rounded cursor-pointer ${selectedItem === item
                      ? 'border-blue-500'
                      : 'border-gray-700'
                      }`}
                    onClick={() => {
                      setSelectedItem(item)
                      setQuantity(1)
                    }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-1 right-1 bg-gray-900 rounded px-1 text-xs text-yellow-400">
                        {getBuyPrice(item)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Player inventory
                playerInventory.items.map((item, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 bg-gray-800 border rounded cursor-pointer ${selectedItem === item
                      ? 'border-blue-500'
                      : 'border-gray-700'
                      }`}
                    onClick={() => {
                      setSelectedItem(item)
                      setQuantity(1)
                    }}
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={item.icon}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-1 right-1 bg-gray-900 rounded px-1 text-xs text-yellow-400">
                        {getSellPrice(item)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="absolute top-1 right-1 bg-gray-900 rounded px-1 text-xs">
                          {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Item details */}
          {selectedItem && (
            <div className="w-72 bg-gray-800 p-4 rounded">
              <h3 className={`text-lg font-bold ${getQualityColor(selectedItem.quality)}`}>
                {selectedItem.name}
              </h3>
              <div className="text-gray-400 text-sm mb-2">
                {selectedItem.type}
              </div>
              <div className="text-white text-sm mb-4">
                {selectedItem.description}
              </div>

              {selectedItem.requirements && (
                <div className="mb-4">
                  <div className="text-red-400 text-sm font-bold mb-1">
                    Requirements:
                  </div>
                  {selectedItem.requirements.level && (
                    <div className="text-sm">
                      Level {selectedItem.requirements.level}
                    </div>
                  )}
                  {selectedItem.requirements.stats &&
                    Object.entries(selectedItem.requirements.stats).map(([stat, value]) => (
                      <div key={stat} className="text-sm">
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
                      </div>
                    ))
                  }
                </div>
              )}

              {selectedItem.effects && selectedItem.effects.length > 0 && (
                <div className="mb-4">
                  <div className="text-blue-400 text-sm font-bold mb-1">
                    Effects:
                  </div>
                  {selectedItem.effects.map((effect, index) => (
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

              {selectedItem.maxStack > 1 && (
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-1">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 bg-gray-700 rounded"
                      onClick={() => handleQuantityChange(quantity - 1)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedItem.maxStack}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                      className="w-16 text-center bg-gray-700 rounded px-2 py-1"
                    />
                    <button
                      className="px-2 py-1 bg-gray-700 rounded"
                      onClick={() => handleQuantityChange(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="text-yellow-400 text-lg mb-4">
                Total: {selectedTab === 'buy'
                  ? getBuyPrice(selectedItem) * quantity
                  : getSellPrice(selectedItem) * quantity
                } gold
              </div>

              <button
                className={`w-full py-2 rounded ${selectedTab === 'buy'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
                  }`}
                onClick={() => selectedTab === 'buy'
                  ? handleBuy(selectedItem)
                  : handleSell(selectedItem)
                }
              >
                {selectedTab === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopUI
