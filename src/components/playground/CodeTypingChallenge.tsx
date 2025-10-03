'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  timeElapsed: number
}

interface CodeSnippet {
  id: string
  title: string
  language: string
  code: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'react-component',
    title: 'React Component',
    language: 'jsx',
    difficulty: 'easy',
    code: `function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  );
}`
  },
  {
    id: 'js-array-methods',
    title: 'JavaScript Array Methods',
    language: 'javascript',
    difficulty: 'medium',
    code: `const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
console.log({ doubled, evens, sum });`
  },
  {
    id: 'async-fetch',
    title: 'Async/Await Fetch',
    language: 'javascript',
    difficulty: 'medium',
    code: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}`
  },
  {
    id: 'python-class',
    title: 'Python Class',
    language: 'python',
    difficulty: 'hard',
    code: `class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def get_history(self):
        return self.history.copy()`
  },
  {
    id: 'css-flexbox',
    title: 'CSS Flexbox',
    language: 'css',
    difficulty: 'easy',
    code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  gap: 1rem;
}

.item {
  flex: 1;
  padding: 1rem;
  background: #f0f0f0;
  border-radius: 8px;
}`
  }
]

export default function CodeTypingChallenge() {
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet>(CODE_SNIPPETS[0])
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [errors, setErrors] = useState(0)
  const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 0, errors: 0, timeElapsed: 0 })
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const filteredSnippets = CODE_SNIPPETS.filter(snippet => snippet.difficulty === difficulty)
  const targetText = currentSnippet.code

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
    if (!isStarted) {
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
      setIsCompleted(true)
      setStats(calculateStats())
    }
  }

  const resetChallenge = () => {
    setUserInput('')
    setStartTime(null)
    setIsStarted(false)
    setIsCompleted(false)
    setCurrentPosition(0)
    setErrors(0)
    setStats({ wpm: 0, accuracy: 0, errors: 0, timeElapsed: 0 })
    inputRef.current?.focus()
  }

  const selectRandomSnippet = () => {
    const availableSnippets = filteredSnippets.filter(s => s.id !== currentSnippet.id)
    if (availableSnippets.length > 0) {
      const randomSnippet = availableSnippets[Math.floor(Math.random() * availableSnippets.length)]
      setCurrentSnippet(randomSnippet)
    }
    resetChallenge()
  }

  const changeDifficulty = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty)
    const newSnippets = CODE_SNIPPETS.filter(s => s.difficulty === newDifficulty)
    if (newSnippets.length > 0) {
      setCurrentSnippet(newSnippets[0])
    }
    resetChallenge()
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
    <div className="flex flex-col items-center space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">⚡ Code Typing Challenge</h2>
        <p className="text-muted-foreground">Test your coding speed and accuracy</p>
      </div>

      {/* Difficulty Selector */}
      <div className="flex space-x-2">
        {(['easy', 'medium', 'hard'] as const).map((level) => (
          <button
            key={level}
            onClick={() => changeDifficulty(level)}
            className={`px-4 py-2 rounded-lg transition-colors capitalize ${difficulty === level
                ? 'bg-accent text-white'
                : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Current Challenge Info */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">{currentSnippet.title}</h3>
        <p className="text-sm text-muted-foreground">
          {currentSnippet.language.toUpperCase()} • {targetText.length} characters
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-2xl font-bold text-accent">{stats.wpm}</div>
          <div className="text-sm text-muted-foreground">WPM</div>
        </div>
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-2xl font-bold text-accent">{stats.accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-2xl font-bold text-destructive">{errors}</div>
          <div className="text-sm text-muted-foreground">Errors</div>
        </div>
        <div className="text-center p-4 bg-secondary/20 rounded-lg">
          <div className="text-2xl font-bold text-accent">{Math.round(stats.timeElapsed)}</div>
          <div className="text-sm text-muted-foreground">Seconds</div>
        </div>
      </div>

      {/* Code Display */}
      <div className="w-full max-w-3xl">
        <div className="bg-secondary/20 rounded-lg p-4 border border-secondary/30">
          <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
            {renderCodeWithHighlight()}
          </pre>
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-3xl">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={isCompleted}
          className="w-full h-32 p-4 bg-background border border-secondary/30 rounded-lg resize-none focus:outline-none focus:border-accent transition-colors font-mono text-sm"
          placeholder={isCompleted ? "Challenge completed!" : "Start typing the code above..."}
        />
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button
          onClick={resetChallenge}
          className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          onClick={selectRandomSnippet}
          className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
        >
          New Challenge
        </button>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-secondary/80 backdrop-blur rounded-xl p-8 text-center space-y-4 border border-secondary/30 max-w-md mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-2xl font-bold text-accent">🎉 Challenge Complete!</h3>
              <div className="space-y-2">
                <p className="text-foreground">
                  <strong>WPM:</strong> <span className="text-accent">{stats.wpm}</span>
                </p>
                <p className="text-foreground">
                  <strong>Accuracy:</strong> <span className="text-accent">{stats.accuracy}%</span>
                </p>
                <p className="text-foreground">
                  <strong>Time:</strong> <span className="text-accent">{Math.round(stats.timeElapsed)}s</span>
                </p>
                <p className="text-foreground">
                  <strong>Errors:</strong> <span className="text-destructive">{errors}</span>
                </p>
              </div>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={selectRandomSnippet}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
                >
                  Next Challenge
                </button>
                <button
                  onClick={() => setIsCompleted(false)}
                  className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-2xl">
        <p className="mb-2">Type the code exactly as shown above. Special characters are marked:</p>
        <p>· = space, ↵ = enter/newline</p>
        <p className="mt-2">Green = correct, Red = incorrect, Blue = current position</p>
      </div>
    </div>
  )
}