'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Grid = (number | null)[][]
type Direction = 'up' | 'down' | 'left' | 'right'
type GameStatus = 'playing' | 'won' | 'lost' | 'namePrompt'

interface HighScore {
  score: number
  username: string
  exists: boolean
}

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
  const [highScore, setHighScore] = useState<HighScore>({ score: 0, username: 'Set a high score!', exists: false })
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [hasWon, setHasWon] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Fetch high score from database
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const response = await fetch('/api/high-scores/2048')
        const data = await response.json()
        setHighScore(data)
      } catch (error) {
        console.error('Error fetching high score:', error)
      }
    }
    fetchHighScore()
  }, [])

  const getTileColor = (value: number | null) => {
    if (value === null) return 'bg-gray-800'

    const colors: { [key: number]: string } = {
      2: 'bg-blue-500 text-white',
      4: 'bg-blue-600 text-white',
      8: 'bg-orange-500 text-white',
      16: 'bg-orange-600 text-white',
      32: 'bg-red-500 text-white',
      64: 'bg-red-600 text-white',
      128: 'bg-yellow-500 text-white',
      256: 'bg-yellow-600 text-white',
      512: 'bg-yellow-700 text-white',
      1024: 'bg-green-500 text-white',
      2048: 'bg-green-600 text-white'
    }

    return colors[value] || 'bg-purple-600 text-white'
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

      // Check for win condition
      if (!hasWon && newGrid.some(row => row.some(cell => cell === 2048))) {
        setHasWon(true)
        setGameStatus('won')
      }
      // Check for game over
      else if (!hasValidMove(newGrid)) {
        setGameStatus('lost')
        
        // Check if high score was beaten
        if (newScore > highScore.score) {
          setGameStatus('namePrompt')
        }
      }
    }
  }, [grid, score, gameStatus, hasWon, highScore.score])

  const resetGame = () => {
    setGrid(initializeGame())
    setScore(0)
    setGameStatus('playing')
    setHasWon(false)
    setIsInitialized(true)
    setPlayerName('')
  }

  const continueGame = () => {
    setGameStatus('playing')
  }

  const handleSaveHighScore = async () => {
    if (!playerName.trim()) return

    try {
      const response = await fetch('/api/high-scores/2048', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playerName.trim(), score })
      })

      if (response.ok) {
        setHighScore({ score, username: playerName.trim(), exists: true })
        setGameStatus('lost')
      }
    } catch (error) {
      console.error('Error saving high score:', error)
    }
  }

  // Initialize game only on client side to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      setGrid(initializeGame())
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const minSwipeDistance = 30

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        makeMove(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        makeMove(deltaY > 0 ? 'down' : 'up')
      }
    }

    setTouchStart(null)
  }

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

  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full">
      {/* Header */}
      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">2048</h2>
        <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
          <span className="text-white/70">
            Score: <span className="text-sky-400 font-bold text-xl">{score}</span>
          </span>
          <span className="text-white/70">
            High Score: <span className="text-amber-400 font-bold text-xl">{highScore.score}</span>
            <span className="block text-xs text-white/50 mt-1">{highScore.username}</span>
          </span>
        </div>
      </div>

      {/* Game Board */}
      <div 
        ref={gameContainerRef}
        className="relative w-full max-w-lg"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!isInitialized ? (
          <div className="grid grid-cols-4 gap-3 bg-black/60 rounded-lg p-4 border-2 border-sky-400/40">
            {Array.from({ length: 16 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg flex items-center justify-center bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 bg-black/60 rounded-lg p-4 border-2 border-sky-400/40">
            {grid.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold ${getTileColor(value)}`}
                >
                  {value || ''}
                </div>
              ))
            )}
          </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
          {gameStatus === 'namePrompt' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
            >
              <div className="text-center space-y-4 p-6 max-w-md">
                <h3 className="text-2xl font-bold text-amber-400">🎉 New High Score!</h3>
                <p className="text-white text-xl">Score: {score}</p>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-sky-400"
                  maxLength={20}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveHighScore()}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveHighScore}
                    disabled={!playerName.trim()}
                    className="flex-1 px-6 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                  >
                    Save
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {(gameStatus === 'won' || gameStatus === 'lost') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-white p-6">
                <h3 className="text-2xl font-bold mb-4">
                  {gameStatus === 'won' ? '🎉 You Won!' : '😞 Game Over'}
                </h3>
                <p className="text-lg mb-6">Final Score: <span className="text-sky-400 font-bold">{score}</span></p>
                <div className="flex space-x-4">
                  <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
                  >
                    Try Again
                  </button>
                  {gameStatus === 'won' && (
                    <button
                      onClick={continueGame}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
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

      {/* Arrow Pad Controls */}
      <div className="flex flex-col items-center space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => makeMove('up')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move up"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div></div>
          <button
            onClick={() => makeMove('left')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-14 h-14"></div>
          <button
            onClick={() => makeMove('right')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div></div>
          <button
            onClick={() => makeMove('down')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move down"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div></div>
        </div>
        <button
          onClick={resetGame}
          className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-semibold"
        >
          🔄 New Game
        </button>
      </div>

      {/* Controls Info */}
      <div className="text-center text-sm text-white/60 space-y-2 max-w-md">
        <p><strong className="text-white/80">Desktop:</strong> Arrow keys to move</p>
        <p><strong className="text-white/80">Mobile:</strong> Swipe to move</p>
        <p><strong className="text-white/80">Universal:</strong> Use arrow pad above</p>
        <p className="text-white/50 text-xs mt-3">Merge tiles to reach 2048!</p>
      </div>
    </div>
  )
}