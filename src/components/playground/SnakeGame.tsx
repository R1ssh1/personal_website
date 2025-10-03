'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Direction = 'up' | 'down' | 'left' | 'right'
type GameState = 'idle' | 'playing' | 'gameOver'

interface Position {
  x: number
  y: number
}

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = 'right'
const GAME_SPEED = 150

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

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

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return

    setSnake(currentSnake => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      // Move head based on direction
      switch (direction) {
        case 'up':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE
          break
        case 'down':
          head.y = (head.y + 1) % GRID_SIZE
          break
        case 'left':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE
          break
        case 'right':
          head.x = (head.x + 1) % GRID_SIZE
          break
      }

      // Check collision with self
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver')
        return currentSnake
      }

      newSnake.unshift(head)

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10)
        setFood(generateFood())
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameState, generateFood])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'idle') {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          startGame()
        }
        return
      }

      if (gameState === 'gameOver') {
        if (e.key === ' ') {
          resetGame()
        }
        return
      }

      switch (e.key) {
        case 'ArrowUp':
          setDirection(prev => prev !== 'down' ? 'up' : prev)
          break
        case 'ArrowDown':
          setDirection(prev => prev !== 'up' ? 'down' : prev)
          break
        case 'ArrowLeft':
          setDirection(prev => prev !== 'right' ? 'left' : prev)
          break
        case 'ArrowRight':
          setDirection(prev => prev !== 'left' ? 'right' : prev)
          break
        case ' ':
          setGameState('idle')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState])

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      const gameInterval = setInterval(moveSnake, GAME_SPEED)
      return () => clearInterval(gameInterval)
    }
  }, [gameState, moveSnake])

  // Update high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('snakeHighScore', score.toString())
    }
  }, [score, highScore])

  // Load high score on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  const startGame = () => {
    setGameState('playing')
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    setFood({ x: 5, y: 5 })
    setScore(0)
    setGameState('idle')
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🐍 Snake Game</h2>
        <div className="flex items-center justify-center space-x-8 text-sm">
          <span className="text-muted-foreground">Score: <span className="text-accent font-bold">{score}</span></span>
          <span className="text-muted-foreground">High Score: <span className="text-accent font-bold">{highScore}</span></span>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <div
          className="grid bg-secondary/20 rounded-lg border-2 border-secondary/30 p-2"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '1px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const isSnake = snake.some(segment => segment.x === x && segment.y === y)
            const isFood = food.x === x && food.y === y
            const isHead = snake[0]?.x === x && snake[0]?.y === y

            return (
              <motion.div
                key={index}
                className={`w-4 h-4 ${isSnake
                    ? isHead
                      ? 'bg-accent'
                      : 'bg-accent/70'
                    : isFood
                      ? 'bg-destructive'
                      : 'bg-background/50'
                  }`}
                animate={isFood ? { scale: [1, 1.2, 1] } : {}}
                transition={isFood ? { repeat: Infinity, duration: 1 } : {}}
              />
            )
          })}
        </div>

        {/* Game State Overlays */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div
              className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-foreground">Ready to Play?</h3>
                <p className="text-muted-foreground">Use arrow keys to move</p>
                <button
                  onClick={startGame}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-destructive">Game Over!</h3>
                <p className="text-muted-foreground">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p><strong>Controls:</strong> Arrow keys to move, Space to pause/reset</p>
        <p>Eat the red food 🍎 to grow and increase your score!</p>
      </div>
    </div>
  )
}