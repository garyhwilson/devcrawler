// src/game/ui/FullMap.jsx

import React, { useEffect, useRef, useState } from 'react'

const FullMap = ({
  gridManager,
  player,
  entities,
  revealedAreas,
  discoveredRooms,
  questMarkers,
  onClose
}) => {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showLegend, setShowLegend] = useState(true)

  // Colors for map elements (same as minimap but with more details)
  const colors = {
    wall: '#333333',
    floor: '#666666',
    door: {
      closed: '#8B4513',
      open: '#4a2',
      locked: '#a33'
    },
    unexplored: '#111111',
    player: '#ffff00',
    enemy: '#ff0000',
    npc: '#00ff00',
    quest: '#ffaa00',
    item: '#00ffff',
    merchant: '#ff00ff',
    boss: '#ff0000',
    room: {
      standard: '#444',
      entrance: '#4a9',
      largeHall: '#66a',
      boss: '#a44',
      storage: '#974',
      treasure: '#aa4'
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Calculate tile size based on zoom level
    const tileSize = 32 * zoom

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply pan transformation
    ctx.save()
    ctx.translate(pan.x, pan.y)

    // Draw grid with room coloring
    for (let y = 0; y < gridManager.height; y++) {
      for (let x = 0; x < gridManager.width; x++) {
        const cell = gridManager.getCell(x, y)
        if (!cell || !revealedAreas.has(`${x},${y}`)) {
          // Draw unexplored area
          ctx.fillStyle = colors.unexplored
        } else {
          // Get room type for coloring
          const room = discoveredRooms.find(r =>
            x >= r.x && x < r.x + r.width &&
            y >= r.y && y < r.y + r.height
          )

          if (room) {
            ctx.fillStyle = colors.room[room.type] || colors.room.standard
          } else {
            // Draw regular cells
            switch (cell.type) {
              case 'wall':
                ctx.fillStyle = colors.wall
                break
              case 'floor':
                ctx.fillStyle = colors.floor
                break
              case 'door':
                ctx.fillStyle = cell.isLocked ?
                  colors.door.locked :
                  cell.isOpen ? colors.door.open : colors.door.closed
                break
              default:
                ctx.fillStyle = colors.unexplored
            }
          }
        }

        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)

        // Draw grid lines
        ctx.strokeStyle = '#222'
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    // Draw entities
    entities.forEach(entity => {
      if (!revealedAreas.has(`${Math.floor(entity.x)},${Math.floor(entity.y)}`)) return

      const screenX = entity.x * tileSize
      const screenY = entity.y * tileSize

      // Draw entity circle
      ctx.beginPath()
      if (entity.type === 'enemy') {
        ctx.fillStyle = entity.isBoss ? colors.boss : colors.enemy
      } else if (entity.type === 'npc') {
        ctx.fillStyle = entity.isMerchant ? colors.merchant : colors.npc
      } else if (entity.type === 'item') {
        ctx.fillStyle = colors.item
      }

      ctx.arc(
        screenX + tileSize / 2,
        screenY + tileSize / 2,
        tileSize / 3,
        0,
        Math.PI * 2
      )
      ctx.fill()

      // Draw entity name
      if (zoom >= 1) {
        ctx.fillStyle = '#fff'
        ctx.font = `${12 * zoom}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(
          entity.name,
          screenX + tileSize / 2,
          screenY - 5 * zoom
        )
      }
    })

    // Draw quest markers
    questMarkers.forEach(marker => {
      const screenX = marker.x * tileSize
      const screenY = marker.y * tileSize

      // Draw marker icon
      ctx.fillStyle = colors.quest
      ctx.beginPath()
      ctx.moveTo(screenX + tileSize / 2, screenY)
      ctx.lineTo(screenX + tileSize, screenY + tileSize)
      ctx.lineTo(screenX, screenY + tileSize)
      ctx.closePath()
      ctx.fill()

      // Draw quest name
      if (zoom >= 1) {
        ctx.fillStyle = '#fff'
        ctx.font = `${12 * zoom}px Arial`
        ctx.textAlign = 'center'
        ctx.fillText(
          marker.questName,
          screenX + tileSize / 2,
          screenY - 5 * zoom
        )
      }
    })

    // Draw player last (on top)
    const playerScreenX = player.x * tileSize
    const playerScreenY = player.y * tileSize

    // Player direction arrow
    ctx.fillStyle = colors.player
    ctx.beginPath()
    ctx.save()
    ctx.translate(playerScreenX + tileSize / 2, playerScreenY + tileSize / 2)
    ctx.rotate(player.rotation)
    ctx.moveTo(0, -tileSize / 2)
    ctx.lineTo(tileSize / 3, tileSize / 2)
    ctx.lineTo(-tileSize / 3, tileSize / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.restore() // Restore canvas transform
  }, [gridManager, player, entities, revealedAreas, discoveredRooms, questMarkers, zoom, pan])

  // Mouse event handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta))

    // Adjust pan to keep the point under cursor in the same place
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPan({
      x: x - (x - pan.x) * (newZoom / zoom),
      y: y - (y - pan.y) * (newZoom / zoom)
    })

    setZoom(newZoom)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50">
      <div className="absolute inset-4 bg-gray-900 rounded-lg p-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">World Map</h2>
          <div className="flex items-center gap-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-2 text-white">
              <button
                className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                -
              </button>
              <span className="w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center hover:bg-gray-700"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              >
                +
              </button>
            </div>

            {/* Toggle legend */}
            <button
              className="text-gray-400 hover:text-white"
              onClick={() => setShowLegend(!showLegend)}
            >
              {showLegend ? 'Hide Legend' : 'Show Legend'}
            </button>

            {/* Close button */}
            <button
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={canvasRef.current?.parentElement.clientWidth || 800}
            height={canvasRef.current?.parentElement.clientHeight || 600}
            className="w-full h-full cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Legend */}
          {showLegend && (
            <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-90 p-4 rounded">
              <h3 className="text-white font-bold mb-2">Legend</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                {/* Rooms */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Rooms</h4>
                  {Object.entries(colors.room).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-300 text-sm">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Entities */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Entities</h4>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.player }}
                    />
                    <span className="text-gray-300 text-sm">Player</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.enemy }}
                    />
                    <span className="text-gray-300 text-sm">Enemy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.npc }}
                    />
                    <span className="text-gray-300 text-sm">NPC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colors.merchant }}
                    />
                    <span className="text-gray-300 text-sm">Merchant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4"
                      style={{ backgroundColor: colors.quest }}
                    />
                    <span className="text-gray-300 text-sm">Quest</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FullMap
