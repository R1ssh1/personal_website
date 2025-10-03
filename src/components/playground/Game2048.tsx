'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Grid = (number | null)[][]
type Direction = 'up' | 'down' | 'left' | 'right'

const GRID_SIZE = 4

const getEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))

const getRandomEmptyPosition = (grid: Grid): [number, number] | null => {
  const emptyPositions: [number, number][] = []

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) {
        emptyPositions.push([row, col])
      }
    }
  }

  if (emptyPositions.length === 0) return null

  const randomIndex = Math.floor(Math.random() * emptyPositions.length)
  return emptyPositions[randomIndex]
}

const addRandomTile = (grid: Grid): Grid => {
  const newGrid = grid.map(row => [...row])
  const position = getRandomEmptyPosition(newGrid)

  if (position) {
    const [row, col] = position
    newGrid[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  return newGrid
}

const initializeGame = (): Grid => {
  let grid = getEmptyGrid()
  grid = addRandomTile(grid)
  grid = addRandomTile(grid)
  return grid
}

const moveLeft = (grid: Grid): { grid: Grid; moved: boolean; score: number } => {
  const newGrid = grid.map(row => [...row])
  let moved = false
  let score = 0

  for (let row = 0; row < GRID_SIZE; row++) {
    const line: (number | null)[] = newGrid[row].filter(cell => cell !== null)

    // Merge tiles
    for (let i = 0; i < line.length - 1; i++) {
      if (line[i] === line[i + 1]) {
        line[i] = (line[i] as number) * 2
        score += line[i] as number
        line.splice(i + 1, 1)
      }
    }

    // Add nulls to the right
    while (line.length < GRID_SIZE) {
      line.push(null)
    }

    // Check if row changed
    for (let col = 0; col < GRID_SIZE; col++) {
      if (newGrid[row][col] !== line[col]) {
        moved = true
      }
      newGrid[row][col] = line[col]
    }
  }

  return { grid: newGrid, moved, score }
}

const moveRight = (grid: Grid): { grid: Grid; moved: boolean; score: number } => {
  const newGrid = grid.map(row => [...row])
  let moved = false
  let score = 0

  for (let row = 0; row < GRID_SIZE; row++) {
    const line: (number | null)[] = newGrid[row].filter(cell => cell !== null)

    // Merge tiles (from right)
    for (let i = line.length - 1; i > 0; i--) {
      if (line[i] === line[i - 1]) {
        line[i] = (line[i] as number) * 2
        score += line[i] as number
        line.splice(i - 1, 1)
        i-- // Skip the next iteration
      }
    }

    // Add nulls to the left
    while (line.length < GRID_SIZE) {
      line.unshift(null)
    }

    // Check if row changed
    for (let col = 0; col < GRID_SIZE; col++) {
      if (newGrid[row][col] !== line[col]) {
        moved = true
      }
      newGrid[row][col] = line[col]
    }
  }

  return { grid: newGrid, moved, score }
}

const moveUp = (grid: Grid): { grid: Grid; moved: boolean; score: number } => {
  const newGrid = grid.map(row => [...row])
  let moved = false
  let score = 0

  for (let col = 0; col < GRID_SIZE; col++) {
    const line: (number | null)[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      if (newGrid[row][col] !== null) {
        line.push(newGrid[row][col])
      }
    }

    // Merge tiles
    for (let i = 0; i < line.length - 1; i++) {
      if (line[i] === line[i + 1]) {
        line[i] = (line[i] as number) * 2
        score += line[i] as number
        line.splice(i + 1, 1)
      }
    }

    // Fill the column
    for (let row = 0; row < GRID_SIZE; row++) {
      const newValue = row < line.length ? line[row] : null
      if (newGrid[row][col] !== newValue) {
        moved = true
      }
      newGrid[row][col] = newValue
    }
  }

  return { grid: newGrid, moved, score }
}

const moveDown = (grid: Grid): { grid: Grid; moved: boolean; score: number } => {
  const newGrid = grid.map(row => [...row])
  let moved = false
  let score = 0

  for (let col = 0; col < GRID_SIZE; col++) {
    const line: (number | null)[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      if (newGrid[row][col] !== null) {
        line.push(newGrid[row][col])
      }
    }

    // Merge tiles (from bottom)
    for (let i = line.length - 1; i > 0; i--) {
      if (line[i] === line[i - 1]) {
        line[i] = (line[i] as number) * 2
        score += line[i] as number
        line.splice(i - 1, 1)
        i-- // Skip the next iteration
      }
    }

    // Fill the column from bottom
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      const lineIndex = line.length - (GRID_SIZE - row)
      const newValue = lineIndex >= 0 ? line[lineIndex] : null
      if (newGrid[row][col] !== newValue) {
        moved = true
      }
      newGrid[row][col] = newValue
    }
  }

  return { grid: newGrid, moved, score }
}

const hasValidMove = (grid: Grid): boolean => {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === null) return true
    }
  }

  // Check for possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col]
      if (
        (row < GRID_SIZE - 1 && grid[row + 1][col] === current) ||
        (col < GRID_SIZE - 1 && grid[row][col + 1] === current)
      ) {
        return true
      }
    }
  }

  return false
}

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>(getEmptyGrid())
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [hasWon, setHasWon] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const getTileColor = (value: number | null) => {
    if (value === null) return 'bg-secondary/20'

    const colors: { [key: number]: string } = {
      2: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800',
      4: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800',
      8: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800',
      16: 'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800',
      32: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800',
      64: 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800',
      128: 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800',
      256: 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800',
      512: 'bg-gradient-to-br from-red-200 to-red-300 text-red-900',
      1024: 'bg-gradient-to-br from-yellow-200 to-yellow-300 text-yellow-900',
      2048: 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-yellow-900'
    }

    return colors[value] || 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800'
  }

  const makeMove = useCallback((direction: Direction) => {
    if (gameStatus !== 'playing') return

    let result
    switch (direction) {
      case 'left':
        result = moveLeft(grid)
        break
      case 'right':
        result = moveRight(grid)
        break
      case 'up':
        result = moveUp(grid)
        break
      case 'down':
        result = moveDown(grid)
        break
    }

    if (result.moved) {
      const newGrid = addRandomTile(result.grid)
      setGrid(newGrid)
      const newScore = score + result.score
      setScore(newScore)
      setBestScore(prev => Math.max(prev, newScore))

      // Check for win condition
      if (!hasWon && newGrid.some(row => row.some(cell => cell === 2048))) {
        setHasWon(true)
        setGameStatus('won')
      }
      // Check for game over
      else if (!hasValidMove(newGrid)) {
        setGameStatus('lost')
      }
    }
  }, [grid, score, gameStatus, hasWon])

  const resetGame = () => {
    setGrid(initializeGame())
    setScore(0)
    setGameStatus('playing')
    setHasWon(false)
    setIsInitialized(true)
  }

  const continueGame = () => {
    setGameStatus('playing')
  }

  // Initialize game only on client side to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setGrid(initializeGame())
      setIsInitialized(true)
    }
  }, [isInitialized])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          makeMove('up')
          break
        case 'ArrowDown':
          e.preventDefault()
          makeMove('down')
          break
        case 'ArrowLeft':
          e.preventDefault()
          makeMove('left')
          break
        case 'ArrowRight':
          e.preventDefault()
          makeMove('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [makeMove])

  useEffect(() => {
    const saved = localStorage.getItem('2048-best-score')
    if (saved) setBestScore(parseInt(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('2048-best-score', bestScore.toString())
  }, [bestScore])

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🎯 2048</h2>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <span className="text-muted-foreground">Score: <span className="text-accent font-bold">{score}</span></span>
          <span className="text-muted-foreground">Best: <span className="text-accent font-bold">{bestScore}</span></span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        {!isInitialized ? (
          <div className="grid grid-cols-4 gap-2 bg-secondary/20 rounded-lg p-4 border-2 border-secondary/30">
            {Array.from({ length: 16 }).map((_, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded-lg flex items-center justify-center bg-secondary/20 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 bg-secondary/20 rounded-lg p-4 border-2 border-secondary/30">
            {grid.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center text-lg font-bold ${getTileColor(value)}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {value || ''}
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameStatus !== 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-white p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {gameStatus === 'won' ? '🎉 You Won!' : '😞 Game Over'}
                </h3>
                <p className="text-lg mb-6">Final Score: {score}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  {gameStatus === 'won' && (
                    <button
                      onClick={continueGame}
                      className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
                    >
                      Continue
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="text-center space-y-4">
        <button
          onClick={resetGame}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          🔄 New Game
        </button>

        <div className="text-sm text-muted-foreground max-w-md">
          <p className="mb-2">🎮 <strong>How to Play:</strong></p>
          <p>Use arrow keys or swipe to move tiles. When two tiles with the same number touch, they merge into one!</p>
          <p className="mt-2">🏆 <strong>Goal:</strong> Create a tile with the number 2048!</p>
        </div>
      </div>
    </div>
  )
}