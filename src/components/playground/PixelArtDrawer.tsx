'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Pixel {
  x: number
  y: number
  color: string
}

const GRID_SIZE = 20
const PIXEL_SIZE = 16

const PROGRAMMING_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
  '#FEE2E2', // Light Red
  '#DBEAFE', // Light Blue
  '#D1FAE5', // Light Green
]

export default function PixelArtDrawer() {
  const [pixels, setPixels] = useState<Map<string, string>>(new Map())
  const [currentColor, setCurrentColor] = useState(PROGRAMMING_COLORS[0])
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<'pen' | 'eraser' | 'fill'>('pen')
  const canvasRef = useRef<HTMLDivElement>(null)

  const getPixelKey = (x: number, y: number) => `${x},${y}`

  const setPixel = useCallback((x: number, y: number, color: string | null) => {
    setPixels(prev => {
      const newPixels = new Map(prev)
      const key = getPixelKey(x, y)

      if (color === null) {
        newPixels.delete(key)
      } else {
        newPixels.set(key, color)
      }

      return newPixels
    })
  }, [])

  const floodFill = useCallback((startX: number, startY: number, targetColor: string | null, fillColor: string) => {
    if (targetColor === fillColor) return

    const toFill: [number, number][] = [[startX, startY]]
    const filled = new Set<string>()

    setPixels(prev => {
      const newPixels = new Map(prev)

      while (toFill.length > 0) {
        const [x, y] = toFill.pop()!
        const key = getPixelKey(x, y)

        if (filled.has(key)) continue
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue

        const currentPixelColor = newPixels.get(key) || null
        if (currentPixelColor !== targetColor) continue

        filled.add(key)
        newPixels.set(key, fillColor)

        // Add adjacent pixels
        toFill.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }

      return newPixels
    })
  }, [])

  const handlePixelInteraction = useCallback((x: number, y: number) => {
    const key = getPixelKey(x, y)
    const existingColor = pixels.get(key) || null

    switch (tool) {
      case 'pen':
        setPixel(x, y, currentColor)
        break
      case 'eraser':
        setPixel(x, y, null)
        break
      case 'fill':
        floodFill(x, y, existingColor, currentColor)
        break
    }
  }, [pixels, currentColor, tool, setPixel, floodFill])

  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true)
    handlePixelInteraction(x, y)
  }

  const handleMouseEnter = (x: number, y: number) => {
    if (isDrawing && tool !== 'fill') {
      handlePixelInteraction(x, y)
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    setPixels(new Map())
  }

  const downloadArt = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = GRID_SIZE * PIXEL_SIZE
    canvas.height = GRID_SIZE * PIXEL_SIZE

    // Fill with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw pixels
    pixels.forEach((color, key) => {
      const [x, y] = key.split(',').map(Number)
      ctx.fillStyle = color
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
    })

    // Download
    const link = document.createElement('a')
    link.download = 'pixel-art.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const saveToLocalStorage = () => {
    const pixelData = Array.from(pixels.entries())
    localStorage.setItem('pixelArt', JSON.stringify(pixelData))
  }

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('pixelArt')
    if (saved) {
      const pixelData = JSON.parse(saved)
      setPixels(new Map(pixelData))
    }
  }

  useEffect(() => {
    // Load saved art on mount
    loadFromLocalStorage()
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDrawing(false)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🎨 Pixel Art Drawer</h2>
        <p className="text-muted-foreground">Create pixel art with programming-themed colors!</p>
      </div>

      {/* Tools */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          {['pen', 'eraser', 'fill'].map((toolType) => (
            <button
              key={toolType}
              onClick={() => setTool(toolType as typeof tool)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${tool === toolType
                ? 'bg-accent text-white'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
            >
              {toolType === 'pen' && '✏️'}
              {toolType === 'eraser' && '🧽'}
              {toolType === 'fill' && '🪣'}
              {toolType}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-secondary/30" />

        <div className="flex space-x-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors"
          >
            🗑️ Clear
          </button>
          <button
            onClick={saveToLocalStorage}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            💾 Save
          </button>
          <button
            onClick={downloadArt}
            className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
          >
            📥 Download
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div className="flex flex-wrap gap-2 max-w-md justify-center">
        {PROGRAMMING_COLORS.map((color) => (
          <motion.button
            key={color}
            onClick={() => setCurrentColor(color)}
            className={`w-8 h-8 rounded-lg border-2 transition-all ${currentColor === color
              ? 'border-accent scale-110'
              : 'border-secondary/30 hover:border-accent/50'
              }`}
            style={{ backgroundColor: color }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="grid bg-secondary/20 rounded-lg border-2 border-secondary/30 p-2 select-none"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gap: '1px'
        }}
        onMouseLeave={() => setIsDrawing(false)}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const x = index % GRID_SIZE
          const y = Math.floor(index / GRID_SIZE)
          const key = getPixelKey(x, y)
          const pixelColor = pixels.get(key)

          return (
            <div
              key={index}
              className="w-4 h-4 border border-secondary/10 cursor-crosshair transition-all hover:scale-110"
              style={{
                backgroundColor: pixelColor || '#f8f9fa'
              }}
              onMouseDown={() => handleMouseDown(x, y)}
              onMouseEnter={() => handleMouseEnter(x, y)}
              onMouseUp={handleMouseUp}
            />
          )
        })}
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>
          <strong>Current Tool:</strong> {tool === 'pen' && '✏️ Pen'}
          {tool === 'eraser' && '🧽 Eraser'}
          {tool === 'fill' && '🪣 Fill'} |
          <strong> Color:</strong> {currentColor}
        </p>
        <p>Click and drag to draw • Use different tools for various effects</p>
        <p>Your art is automatically saved locally</p>
      </div>
    </div>
  )
}