// src/game/ui/Minimap.jsx

import React, { useEffect, useRef } from 'react'

const Minimap = ({
  gridManager,
  player,
  entities,
  revealedAreas,
  mapSize = 150,
  zoom = 1,
  showQuestMarkers = true
}) => {
  const canvasRef = useRef(null)

  // Colors for different map elements
  const colors = {
    wall: '#333333',
    floor: '#666666',
    door: {
      closed: '#8B4513',
      open: '#4a2'
    },
    unexplored: '#111111',
    player: '#ffff00',
    enemy: '#ff0000',
    npc: '#00ff00',
    quest: '#ffaa00',
    item: '#00ffff',
    merchant: '#ff00ff',
    boss: '#ff0000'
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tileSize = mapSize / (20 * zoom) // Show 20x20 tiles at zoom level 1
    const centerX = Math.floor(canvas.width / 2)
    const centerY = Math.floor(canvas.height / 2)

    // Calculate visible area
    const startX = Math.max(0, Math.floor(player.x - 10 * zoom))
    const startY = Math.max(0, Math.floor(player.y - 10 * zoom))
    const endX = Math.min(gridManager.width, Math.floor(player.x + 10 * zoom))
    const endY = Math.min(gridManager.height, Math.floor(player.y + 10 * zoom))

    // Draw grid
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const cell = gridManager.getCell(x, y)
        if (!cell || !revealedAreas.has(`${x},${y}`)) {
          // Draw unexplored area
          ctx.fillStyle = colors.unexplored
        } else {
          // Draw revealed cells
          switch (cell.type) {
            case 'wall':
              ctx.fillStyle = colors.wall
              break
            case 'floor':
              ctx.fillStyle = colors.floor
              break
            case 'door':
              ctx.fillStyle = cell.isOpen ? colors.door.open : colors.door.closed
              break
            default:
              ctx.fillStyle = colors.unexplored
          }
        }

        const screenX = centerX + (x - player.x) * tileSize
        const screenY = centerY + (y - player.y) * tileSize
        ctx.fillRect(screenX, screenY, tileSize, tileSize)
      }
    }

    // Draw entities
    entities.forEach(entity => {
      if (!revealedAreas.has(`${Math.floor(entity.x)},${Math.floor(entity.y)}`)) return

      const screenX = centerX + (entity.x - player.x) * tileSize
      const screenY = centerY + (entity.y - player.y) * tileSize

      if (entity.type === 'enemy') {
        ctx.fillStyle = entity.isBoss ? colors.boss : colors.enemy
      } else if (entity.type === 'npc') {
        ctx.fillStyle = entity.isMerchant ? colors.merchant : colors.npc
      } else if (entity.type === 'item') {
        ctx.fillStyle = colors.item
      }

      ctx.beginPath()
      ctx.arc(
        screenX + tileSize / 2,
        screenY + tileSize / 2,
        tileSize / 2,
        0,
        Math.PI * 2
      )
      ctx.fill()
    })

    // Draw quest markers
    if (showQuestMarkers) {
      entities
        .filter(entity => entity.questMarker)
        .forEach(entity => {
          const screenX = centerX + (entity.x - player.x) * tileSize
          const screenY = centerY + (entity.y - player.y) * tileSize

          // Draw quest marker
          ctx.fillStyle = colors.quest
          ctx.beginPath()
          ctx.moveTo(screenX + tileSize / 2, screenY)
          ctx.lineTo(screenX + tileSize, screenY + tileSize)
          ctx.lineTo(screenX, screenY + tileSize)
          ctx.closePath()
          ctx.fill()
        })
    }

    // Draw player
    ctx.fillStyle = colors.player
    ctx.beginPath()
    ctx.arc(centerX, centerY, tileSize / 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Draw player direction indicator
    const directionLength = tileSize
    ctx.strokeStyle = colors.player
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(
      centerX + Math.cos(player.rotation) * directionLength,
      centerY + Math.sin(player.rotation) * directionLength
    )
    ctx.stroke()

  }, [gridManager, player, entities, revealedAreas, mapSize, zoom, showQuestMarkers])

  const handleMinimapClick = (event) => {
    const rect = event.target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Convert click coordinates to world coordinates
    const tileSize = mapSize / (20 * zoom)
    const centerX = Math.floor(mapSize / 2)
    const centerY = Math.floor(mapSize / 2)

    const worldX = player.x + (x - centerX) / tileSize
    const worldY = player.y + (y - centerY) / tileSize

    // Emit click event with world coordinates
    if (typeof onMinimapClick === 'function') {
      onMinimapClick(Math.floor(worldX), Math.floor(worldY))
    }
  }

  return (
    <div className="relative">
      {/* Minimap Frame */}
      <div className="bg-gray-900 bg-opacity-80 p-2 rounded-lg">
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center
                                 text-white hover:bg-gray-700 transition-colors"
            onClick={() => onZoomChange?.(zoom + 0.5)}
          >
            +
          </button>
          <button
            className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center
                                 text-white hover:bg-gray-700 transition-colors"
            onClick={() => onZoomChange?.(Math.max(1, zoom - 0.5))}
          >
            -
          </button>
        </div>

        {/* Minimap Canvas */}
        <canvas
          ref={canvasRef}
          width={mapSize}
          height={mapSize}
          className="rounded cursor-pointer"
          onClick={handleMinimapClick}
        />

        {/* Legend */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-gray-300">Player</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-300">Enemy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-300">NPC</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-orange-500" />
            <span className="text-gray-300">Quest</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Minimap
