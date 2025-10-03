'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/mind-palace', label: 'Mind Palace' },
  { href: '/sandbox', label: 'The Sandbox' },
  { href: '/contact', label: 'Contact' },
]

export function Navigation() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Wait until mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // Hide navigation only on admin dashboard pages
  if (pathname.startsWith('/admin/dashboard')) {
    return null
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="fixed top-4 left-0 right-0 z-50 hidden md:block">
        <div className="flex justify-center">
          <div className="glass-morphism rounded-full px-8 py-4">
            <div className="flex items-center space-x-8">
              <div className="font-logo text-xl font-semibold text-text">
                Rishi Jha
              </div>
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <div key={item.href} className="font-nav text-sm font-medium text-muted">
                    {item.label}
                  </div>
                ))}
              </div>
              <div className="p-2 rounded-full text-muted">
                <div className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-0 right-0 z-50 hidden md:block"
      >
        <div className="flex justify-center">
          <div className="glass-morphism rounded-full px-8 py-4">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link
                href="/"
                className="font-logo text-xl font-semibold text-text hover:text-accent transition-colors duration-300"
              >
                Rishi Jha
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative font-nav text-sm font-medium transition-colors duration-300 group ${pathname === item.href
                      ? 'text-accent'
                      : 'text-muted hover:text-text'
                      }`}
                  >
                    {item.label}
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {/* Hover indicator */}
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </Link>
                ))}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted hover:text-text transition-colors duration-300 hover:bg-secondary/50"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z" />
                    </svg>
                  )}
                </motion.div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden">
        <div className="glass-morphism rounded-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="font-logo text-lg font-semibold text-text hover:text-accent transition-colors duration-300"
            >
              Rishi Jha
            </Link>

            <div className="flex items-center space-x-4">
              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted hover:text-text transition-colors duration-300 hover:bg-secondary/50"
                aria-label="Toggle theme"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z" />
                    </svg>
                  )}
                </motion.div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-muted hover:text-text transition-colors duration-300 hover:bg-secondary/50"
                aria-label="Toggle menu"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <div className="glass-morphism rounded-2xl px-6 py-4">
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`font-nav text-sm font-medium transition-colors duration-300 ${pathname === item.href
                        ? 'text-accent'
                        : 'text-muted hover:text-text'
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}