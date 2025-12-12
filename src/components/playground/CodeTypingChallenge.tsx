'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  timeElapsed: number
}

interface HighScore {
  score: number
  username: string
  exists: boolean
}

interface TextSnippet {
  id: string
  text: string
  category: string
}

const TEXT_SNIPPETS: TextSnippet[] = [
  {
    id: '1',
    category: '- Bill Gates',
    text: 'The advance of technology is based on making it fit in so that you don\'t really even notice it, so it\'s part of everyday life.'
  },
  {
    id: '2',
    category: '- Marissa Mayer',
    text: 'You can\'t have everything you want, but you can have the things that really matter to you.'
  },
  {
    id: '3',
    category: '- Jeff Bezos',
    text: 'If you\'re competitor-focused, you have to wait until there is a competitor doing something. Being customer-focused allows you to be more pioneering.'
  },
  {
    id: '4',
    category: '- Satya Nadella',
    text: 'We\'re moving into a world where the most valuable skill you can have is the ability to learn new skills.'
  },
  {
    id: '5',
    category: '- Doug Linder',
    text: 'A good programmer is someone who always looks both ways before crossing a one-way street.'
  },
  {
    id: '6',
    category: '- Thomas Edison',
    text: 'Just because something doesn\'t do what you planned it to do doesn\'t mean it\'s useless.'
  },
  {
    id: '7',
    category: '- Elbert Hubbard',
    text: 'One machine can do the work of fifty ordinary men. No machine can do the work of one extraordinary man.'
  },
  {
    id: '8',
    category: '- Steve Jobs',
    text: 'Innovation distinguishes between a leader and a follower.'
  },
  {
    id: '9',
    category: '- Mark Zuckerberg',
    text: 'The biggest risk is not taking any risk. In a world that is changing really quickly, the only strategy that is guaranteed to fail is not taking risks.'
  },
  {
    id: '10',
    category: '- Linus Torvalds',
    text: 'Talk is cheap. Show me the code.'
  },
  {
    id: '11',
    category: '- Grace Hopper',
    text: 'The most dangerous phrase in the language is we have always done it this way.'
  },
  {
    id: '12',
    category: '- Alan Turing',
    text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.'
  },
  {
    id: '13',
    category: '- Elon Musk',
    text: 'When something is important enough, you do it even if the odds are not in your favor.'
  },
  {
    id: '14',
    category: '- Tim Berners-Lee',
    text: 'The web is more a social creation than a technical one. I designed it for a social effect to help people work together and not as a technical toy.'
  },
  {
    id: '15',
    category: '- Ada Lovelace',
    text: 'That brain of mine is something more than merely mortal, as time will show.'
  }
]

export default function CodeTypingChallenge() {
  const [currentSnippet, setCurrentSnippet] = useState<TextSnippet>(TEXT_SNIPPETS[0])
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'completed' | 'namePrompt'>('idle')
  const [currentPosition, setCurrentPosition] = useState(0)
  const [errors, setErrors] = useState(0)
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 0, errors: 0, timeElapsed: 0 })
  const [highScore, setHighScore] = useState<HighScore>({ score: 0, username: 'Set a high score!', exists: false })
  const [playerName, setPlayerName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const targetText = currentSnippet.text

  // Fetch high score from database
  useEffect(() => {
    const fetchHighScore = async () => {
      try {
        const response = await fetch('/api/high-scores/typing')
        const data = await response.json()
        setHighScore(data)
      } catch (error) {
        console.error('Error fetching high score:', error)
      }
    }
    fetchHighScore()
  }, [])

  const calculateStats = useCallback((): TypingStats => {
    if (!startTime) return { wpm: 0, accuracy: 0, errors: 0, timeElapsed: 0 }

    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
    const charactersTyped = userInput.length
    const wpm = Math.round(charactersTyped / 5 / timeElapsed) || 0

    let correctChars = 0
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === targetText[i]) {
        correctChars++
      }
    }

    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 0

    return {
      wpm,
      accuracy,
      errors,
      timeElapsed: timeElapsed * 60 // back to seconds
    }
  }, [startTime, userInput, targetText, errors])

  const handleInputChange = (value: string) => {
    if (gameStatus === 'idle') {
      setGameStatus('playing')
      setIsStarted(true)
      setStartTime(Date.now())
    }

    // Count errors
    let newErrors = errors
    if (value.length > userInput.length) {
      const newChar = value[userInput.length]
      const expectedChar = targetText[userInput.length]
      if (newChar !== expectedChar) {
        newErrors++
        setErrors(newErrors)
      }
    }

    setUserInput(value)
    setCurrentPosition(value.length)

    // Check if completed
    if (value === targetText) {
      const finalStats = calculateStats()
      setIsCompleted(true)
      setStats(finalStats)
      setGameStatus('completed')
      
      // Check if high score was beaten
      if (finalStats.wpm > highScore.score) {
        setGameStatus('namePrompt')
      }
    }
  }

  const resetChallenge = () => {
    setUserInput('')
    setStartTime(null)
    setIsStarted(false)
    setIsCompleted(false)
    setGameStatus('idle')
    setCurrentPosition(0)
    setErrors(0)
    setStats({ wpm: 0, accuracy: 0, errors: 0, timeElapsed: 0 })
    setPlayerName('')
    inputRef.current?.focus()
  }

  const selectRandomSnippet = () => {
    const availableSnippets = TEXT_SNIPPETS.filter(s => s.id !== currentSnippet.id)
    if (availableSnippets.length > 0) {
      const randomSnippet = availableSnippets[Math.floor(Math.random() * availableSnippets.length)]
      setCurrentSnippet(randomSnippet)
    }
    resetChallenge()
  }

  const handleSaveHighScore = async () => {
    if (!playerName.trim()) return

    try {
      const response = await fetch('/api/high-scores/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: playerName.trim(), score: stats.wpm })
      })

      if (response.ok) {
        setHighScore({ score: stats.wpm, username: playerName.trim(), exists: true })
        setGameStatus('completed')
      }
    } catch (error) {
      console.error('Error saving high score:', error)
    }
  }

  // Update stats in real-time
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isStarted && !isCompleted) {
      interval = setInterval(() => {
        setStats(calculateStats())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isStarted, isCompleted, calculateStats])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const renderCodeWithHighlight = () => {
    return targetText.split('').map((char, index) => {
      let className = 'transition-colors duration-150 '

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className += 'bg-green-200 text-green-800'
        } else {
          className += 'bg-red-200 text-red-800'
        }
      } else if (index === currentPosition) {
        className += 'bg-accent text-white animate-pulse'
      } else {
        className += 'text-muted-foreground'
      }

      return (
        <span key={index} className={className}>
          {char === '\n' ? '↵\n' : char === ' ' ? '·' : char}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full">
      {/* Header */}
      <div className="text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Typing Speed Challenge</h2>
        <div className="flex items-center justify-center space-x-8 text-sm md:text-base">
          <span className="text-white/70">
            Current: <span className="text-sky-400 font-bold text-xl">{stats.wpm} WPM</span>
          </span>
          <span className="text-white/70">
            High Score: <span className="text-amber-400 font-bold text-xl">{highScore.score} WPM</span>
            <span className="block text-xs text-white/50 mt-1">{highScore.username}</span>
          </span>
        </div>
      </div>

      {/* Current Text Category */}
      <div className="text-center">
        <p className="text-white text-sm">{currentSnippet.category}</p>
      </div>

      {/* Text Display */}
      <div className="w-full max-w-3xl bg-black/60 rounded-lg p-6 border-2 border-sky-400/40">
        <div className="text-lg md:text-xl leading-relaxed break-words">
          {renderCodeWithHighlight()}
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-3xl">
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={gameStatus === 'completed' || gameStatus === 'namePrompt'}
          className="w-full p-4 bg-gray-800 border-2 border-gray-700 focus:border-sky-400 rounded-lg text-white text-lg focus:outline-none transition-colors"
          placeholder={gameStatus === 'idle' ? "Click here and start typing..." : "Keep typing..."}
          autoComplete="off"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-sky-400">{stats.wpm}</div>
          <div className="text-sm text-white/60">WPM</div>
        </div>
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{stats.accuracy}%</div>
          <div className="text-sm text-white/60">Accuracy</div>
        </div>
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-red-400">{errors}</div>
          <div className="text-sm text-white/60">Errors</div>
        </div>
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-2xl font-bold text-amber-400">{Math.round(stats.timeElapsed)}</div>
          <div className="text-sm text-white/60">Seconds</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={resetChallenge}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-colors font-semibold"
        >
          Reset
        </button>
        <button
          onClick={selectRandomSnippet}
          className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
        >
          New Text
        </button>
      </div>

      {/* Completion Overlays */}
      <AnimatePresence>
        {gameStatus === 'namePrompt' && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 border-2 border-amber-500/50 rounded-xl p-8 text-center space-y-4 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-amber-400">🎉 New High Score!</h3>
              <p className="text-white text-xl">{stats.wpm} WPM</p>
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
                  onClick={resetChallenge}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {gameStatus === 'completed' && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 border-2 border-sky-500/50 rounded-xl p-8 text-center space-y-4 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-sky-400">✅ Complete!</h3>
              <div className="space-y-2 text-white">
                <p><strong>WPM:</strong> <span className="text-sky-400">{stats.wpm}</span></p>
                <p><strong>Accuracy:</strong> <span className="text-green-400">{stats.accuracy}%</span></p>
                <p><strong>Time:</strong> <span className="text-amber-400">{Math.round(stats.timeElapsed)}s</span></p>
                <p><strong>Errors:</strong> <span className="text-red-400">{errors}</span></p>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={selectRandomSnippet}
                  className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors font-semibold"
                >
                  Next Text
                </button>
                <button
                  onClick={resetChallenge}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-sm text-white/60 space-y-2 max-w-md">
        <p className="text-white/80"><strong>How to Play:</strong></p>
        <p>Type the text exactly as shown above</p>
        <p className="text-white/50 text-xs mt-3">· (dot) = space character</p>
        <p className="text-white/50 text-xs">Green = correct • Red = incorrect • Blue = current position</p>
      </div>
    </div>
  )
}