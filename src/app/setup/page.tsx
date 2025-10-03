'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleSetup = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Setup failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-morphism p-8 rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-text mb-2">Portfolio Setup</h1>
            <p className="text-muted">Initialize admin user and sample data</p>
          </motion.div>

          {!result && !error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-muted mb-6">
                Click the button below to set up your portfolio with an admin user and sample certifications.
              </p>

              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Setting up...
                  </div>
                ) : (
                  'Initialize Portfolio'
                )}
              </button>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-green-400 mb-2">✅ Setup Complete!</h3>
                <div className="text-sm space-y-2">
                  <p className="text-muted">{result.admin}</p>
                  <p className="text-muted">{result.certifications}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-secondary/20 rounded-lg p-4">
                  <h4 className="font-medium text-text mb-2">Admin Login Credentials:</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-muted">Username: <span className="font-mono bg-secondary/50 px-2 py-1 rounded">admin</span></p>
                    <p className="text-muted">Password: <span className="font-mono bg-secondary/50 px-2 py-1 rounded">portfolio123</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href="/admin"
                    className="flex-1 py-2 px-4 bg-accent text-white text-center rounded-lg hover:bg-accent/90 transition-colors text-sm"
                  >
                    Go to Admin
                  </a>
                  <a
                    href="/certifications"
                    className="flex-1 py-2 px-4 bg-secondary/50 text-text text-center rounded-lg hover:bg-secondary/70 transition-colors text-sm"
                  >
                    View Certifications
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">❌ Setup Failed</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>

              <button
                onClick={handleSetup}
                disabled={isLoading}
                className="w-full py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                Try Again
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 pt-6 border-t border-secondary/50 text-center"
          >
            <Link
              href="/"
              className="text-muted hover:text-text transition-colors text-sm"
            >
              ← Back to Portfolio
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}