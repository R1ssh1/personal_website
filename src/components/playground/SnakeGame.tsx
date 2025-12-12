'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'
type GameState = 'idle' | 'playing' | 'gameOver' | 'namePrompt'

interface Position {
  x: number
  y: number
}

interface HighScore {
  score: number
  username: string
  exists: boolean
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = 'right'
const GAME_SPEED = 120 // Faster for better responsiveness

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [nextDirection, setNextDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState<HighScore>({ score: 0, username: 'Set a high score!', exists: false })
  const [playerName, setPlayerName] = useState('')
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  // Fetch high score from database
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const response = await fetch('/api/high-scores/snake')
        const data = await response.json()
        setHighScore(data)
      } catch (error) {
        console.error('Error fetching high score:', error)
      }
    }
    fetchHighScore()
  }, [])

  // Generate random food position
  const generateFood = useCallback((): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [snake])

  // Change direction
  const changeDirection = useCallback((newDirection: Direction) => {
    setNextDirection(prev => {
      // Prevent 180-degree turns
      if (
        (prev === 'up' && newDirection === 'down') ||
        (prev === 'down' && newDirection === 'up') ||
        (prev === 'left' && newDirection === 'right') ||
        (prev === 'right' && newDirection === 'left')
      ) {
        return prev
      }
      return newDirection
    })
  }, [])

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return

    setDirection(nextDirection)

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      // Move head based on direction
      switch (nextDirection) {
        case 'up':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE // Portal effect
          break
        case 'down':
          head.y = (head.y + 1) % GRID_SIZE // Portal effect
          break
        case 'left':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE // Portal effect
          break
        case 'right':
          head.x = (head.x + 1) % GRID_SIZE // Portal effect
          break
      }

      // Check collision with self (game over)
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver')

        // Check if high score was beaten
        if (score > highScore.score) {
          setGameState('namePrompt')
        }
        return currentSnake
      }

      newSnake.unshift(head)

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
        // Snake grows - don't pop the tail
      } else {
        newSnake.pop() // Remove tail only if no food eaten
      }

      return newSnake
    })
  }, [nextDirection, food, gameState, generateFood, score, highScore.score])

  // Handle keyboard input (desktop)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'idle') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault()
          startGame()
        }
        return
      }

      if (gameState === 'gameOver' || gameState === 'namePrompt') {
        if (e.key === ' ') {
          e.preventDefault()
          resetGame()
        }
        return
      }

      if (gameState === 'playing') {
        e.preventDefault()
        switch (e.key) {
          case 'ArrowUp':
            changeDirection('up')
            break
          case 'ArrowDown':
            changeDirection('down')
            break
          case 'ArrowLeft':
            changeDirection('left')
            break
          case 'ArrowRight':
            changeDirection('right')
            break
          case ' ':
            setGameState('idle')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState, changeDirection])

  // Handle touch input (mobile)
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

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        changeDirection(deltaX > 0 ? 'right' : 'left')
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        changeDirection(deltaY > 0 ? 'down' : 'up')
      }
    }

    setTouchStart(null)
  }

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const gameInterval = setInterval(moveSnake, GAME_SPEED)
      return () => clearInterval(gameInterval)
    }
  }, [gameState, moveSnake])

  const startGame = () => {
    setGameState('playing')
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setNextDirection(INITIAL_DIRECTION)
    setFood({ x: 5, y: 5 })
    setScore(0)
    setGameState('idle')
    setPlayerName('')
  }

  const handleSaveHighScore = async () => {
    if (!playerName.trim()) return

    try {
      const response = await fetch('/api/high-scores/snake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playerName.trim(), score })
      })

      if (response.ok) {
        // Update local high score
        setHighScore({ score, username: playerName.trim(), exists: true })
        setGameState('gameOver')
      }
    } catch (error) {
      console.error('Error saving high score:', error)
    }
  }

  // Arrow pad controls
  const handleArrowPadClick = (dir: Direction) => {
    if (gameState === 'idle') {
      startGame()
    }
    changeDirection(dir)
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full">
      {/* Header */}
      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Snake Game</h2>
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
        className="relative w-full max-w-2xl"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="grid bg-black/60 rounded-lg border-2 border-sky-400/40 p-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '1px',
            aspectRatio: '1/1'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const isSnake = snake.some(segment => segment.x === x && segment.y === y)
            const isFood = food.x === x && food.y === y
            const isHead = snake[0]?.x === x && snake[0]?.y === y

            return (
              <div
                key={index}
                className={`${isSnake
                  ? isHead
                    ? 'bg-sky-400'
                    : 'bg-sky-500'
                  : isFood
                    ? 'bg-red-500'
                    : 'bg-gray-800'
                  }`}
              />
            )
          })}
        </div>

        {/* Game State Overlays */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center space-y-4 p-6">
                <h3 className="text-2xl font-bold text-white">Ready to Play?</h3>
                <p className="text-white/70">Use arrow keys, swipe, or buttons below</p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'namePrompt' && (
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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

          {gameState === 'gameOver' && (
            <motion.div
              className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center space-y-4 p-6">
                <h3 className="text-2xl font-bold text-red-500">Game Over!</h3>
                <p className="text-white/70 text-lg">Final Score: <span className="text-white font-bold">{score}</span></p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Play Again
                </button>
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
            onClick={() => handleArrowPadClick('up')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move up"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div></div>
          <button
            onClick={() => handleArrowPadClick('left')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-14 h-14"></div>
          <button
            onClick={() => handleArrowPadClick('right')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div></div>
          <button
            onClick={() => handleArrowPadClick('down')}
            className="w-14 h-14 bg-gray-800 hover:bg-sky-600 active:bg-sky-700 border border-gray-700 rounded-lg flex items-center justify-center text-white transition-colors touch-none"
            aria-label="Move down"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div></div>
        </div>
      </div>

      {/* Controls Info */}
      <div className="text-center text-sm text-white/60 space-y-2 max-w-md">
        <p><strong className="text-white/80">Desktop:</strong> Arrow keys to move</p>
        <p><strong className="text-white/80">Mobile:</strong> Swipe to move</p>
        <p><strong className="text-white/80">Universal:</strong> Use arrow pad above</p>
        <p className="text-white/50 text-xs mt-3">Eat the red food to grow. Don&apos;t hit yourself!</p>
      </div>
    </div>
  )
}