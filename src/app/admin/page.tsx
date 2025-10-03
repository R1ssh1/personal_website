'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        router.push('/admin/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('An error occurred during login')
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
            <h1 className="text-3xl font-bold text-text mb-2">Admin Login</h1>
            <p className="text-muted">Access the portfolio dashboard</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                placeholder="Enter username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-secondary/50 border border-secondary rounded-lg text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                placeholder="Enter password"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent hover:bg-accent/90 disabled:bg-accent/50 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
              whileHover={!isLoading ? { y: -1 } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 pt-6 border-t border-secondary/50 text-center"
          >
            <button
              onClick={() => router.push('/')}
              className="text-muted hover:text-text transition-colors text-sm"
            >
              ← Back to Portfolio
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}