'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Card {
  id: number
  icon: string
  name: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_ICONS = [
  { icon: '⚛️', name: 'React' },
  { icon: '🟢', name: 'Node.js' },
  { icon: '🔷', name: 'TypeScript' },
  { icon: '⚡', name: 'Next.js' },
  { icon: '🎨', name: 'CSS' },
  { icon: '📱', name: 'Mobile' },
  { icon: '☁️', name: 'Cloud' },
  { icon: '🔒', name: 'Security' },
  { icon: '🚀', name: 'Deploy' },
  { icon: '🔧', name: 'Tools' },
  { icon: '💾', name: 'Database' },
  { icon: '🌐', name: 'Web' }
]

const DIFFICULTY_LEVELS = {
  easy: { pairs: 6, cols: 3 },
  medium: { pairs: 8, cols: 4 },
  hard: { pairs: 12, cols: 4 }
}

type Difficulty = keyof typeof DIFFICULTY_LEVELS

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const createCards = (difficulty: Difficulty): Card[] => {
  const { pairs } = DIFFICULTY_LEVELS[difficulty]
  const selectedIcons = CARD_ICONS.slice(0, pairs)
  const cardPairs = [...selectedIcons, ...selectedIcons]

  return shuffleArray(cardPairs).map((cardIcon, index) => ({
    id: index,
    icon: cardIcon.icon,
    name: cardIcon.name,
    isFlipped: false,
    isMatched: false
  }))
}

export default function MemoryCardGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number>>({
    easy: 0,
    medium: 0,
    hard: 0
  })

  // Initialize cards after component mounts to avoid hydration mismatch
  useEffect(() => {
    setCards(createCards('easy'))
  }, [])

  const resetGame = useCallback((newDifficulty?: Difficulty) => {
    const selectedDifficulty = newDifficulty || difficulty
    setCards(createCards(selectedDifficulty))
    setFlippedCards([])
    setMatches(0)
    setMoves(0)
    setGameStarted(false)
    setGameCompleted(false)
    setStartTime(null)
    setEndTime(null)
    if (newDifficulty) {
      setDifficulty(newDifficulty)
    }
  }, [difficulty])

  const flipCard = useCallback((cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true)
      setStartTime(Date.now())
    }

    if (flippedCards.length === 2) return
    if (flippedCards.includes(cardId)) return
    if (cards[cardId].isMatched) return

    setCards(prev => prev.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    ))

    setFlippedCards(prev => [...prev, cardId])
  }, [gameStarted, flippedCards, cards])

  // Handle card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards
      const firstCard = cards[firstId]
      const secondCard = cards[secondId]

      if (firstCard.name === secondCard.name) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          ))
          setMatches(prev => prev + 1)
          setFlippedCards([])
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ))
          setFlippedCards([])
        }, 1500)
      }

      setMoves(prev => prev + 1)
    }
  }, [flippedCards, cards])

  // Check for game completion
  useEffect(() => {
    const requiredMatches = DIFFICULTY_LEVELS[difficulty].pairs
    if (matches === requiredMatches && gameStarted && !gameCompleted) {
      setGameCompleted(true)
      setEndTime(Date.now())
    }
  }, [matches, difficulty, gameStarted, gameCompleted])

  // Update best times
  useEffect(() => {
    if (gameCompleted && startTime && endTime) {
      const gameTime = endTime - startTime
      const currentBest = bestTimes[difficulty]

      if (currentBest === 0 || gameTime < currentBest) {
        const newBestTimes = { ...bestTimes, [difficulty]: gameTime }
        setBestTimes(newBestTimes)
        localStorage.setItem('memoryGameBestTimes', JSON.stringify(newBestTimes))
      }
    }
  }, [gameCompleted, startTime, endTime, difficulty, bestTimes])

  // Load best times on mount
  useEffect(() => {
    const savedBestTimes = localStorage.getItem('memoryGameBestTimes')
    if (savedBestTimes) {
      setBestTimes(JSON.parse(savedBestTimes))
    }
  }, [])

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getCurrentTime = () => {
    if (!startTime) return '0:00'
    const currentTime = gameCompleted ? endTime! : Date.now()
    return formatTime(currentTime - startTime)
  }

  const { cols } = DIFFICULTY_LEVELS[difficulty]

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🧠 Memory Match</h2>
        <p className="text-muted-foreground">Match the programming concepts!</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center space-x-8 text-sm">
        <span className="text-muted-foreground">Moves: <span className="text-accent font-bold">{moves}</span></span>
        <span className="text-muted-foreground">Matches: <span className="text-accent font-bold">{matches}/{DIFFICULTY_LEVELS[difficulty].pairs}</span></span>
        <span className="text-muted-foreground">Time: <span className="text-accent font-bold">{getCurrentTime()}</span></span>
      </div>

      {/* Difficulty Selector */}
      <div className="flex space-x-2">
        {Object.keys(DIFFICULTY_LEVELS).map((level) => (
          <button
            key={level}
            onClick={() => resetGame(level as Difficulty)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${difficulty === level
              ? 'bg-accent text-white'
              : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Game Board */}
      {cards.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-secondary/20 rounded-lg border-2 border-secondary/30">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-2"></div>
            <p className="text-muted-foreground">Shuffling cards...</p>
          </div>
        </div>
      ) : (
        <div
          className="grid gap-3 p-4 bg-secondary/20 rounded-lg border-2 border-secondary/30"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="relative w-20 h-20 cursor-pointer"
              onClick={() => flipCard(card.id)}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 rounded-lg preserve-3d"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Card Back */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent/20 to-accent/40 rounded-lg flex items-center justify-center backface-hidden border-2 border-accent/30">
                  <span className="text-2xl">❓</span>
                </div>

                {/* Card Front */}
                <div
                  className={`absolute inset-0 w-full h-full rounded-lg flex flex-col items-center justify-center backface-hidden border-2 transform rotate-y-180 ${card.isMatched
                    ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-300'
                    : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300'
                    }`}
                >
                  <span className="text-2xl mb-1">{card.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">{card.name}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Game Completion Modal */}
      <AnimatePresence>
        {gameCompleted && (
          <motion.div
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-secondary/80 backdrop-blur rounded-xl p-8 text-center space-y-4 border border-secondary/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-accent">🎉 Congratulations!</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">You completed the {difficulty} level!</p>
                <p className="text-foreground">
                  Time: <span className="font-bold text-accent">{formatTime(endTime! - startTime!)}</span>
                </p>
                <p className="text-foreground">
                  Moves: <span className="font-bold text-accent">{moves}</span>
                </p>
                {bestTimes[difficulty] === (endTime! - startTime!) && (
                  <p className="text-yellow-500 font-bold">🏆 New Best Time!</p>
                )}
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => resetGame()}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameCompleted(false)}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Best Times */}
      <div className="text-center">
        <h4 className="text-sm font-semibold text-foreground mb-2">🏆 Best Times</h4>
        <div className="flex space-x-6 text-sm text-muted-foreground">
          {Object.entries(bestTimes).map(([level, time]) => (
            <span key={level} className="capitalize">
              {level}: {time > 0 ? formatTime(time) : '--:--'}
            </span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="text-center">
        <button
          onClick={() => resetGame()}
          className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  )
}