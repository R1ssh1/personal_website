'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Wait until mounted on client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

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
        className="fixed top-4 left-0 right-0 z-50 hidden md:block transition-opacity duration-150"
      >
        <div className="flex justify-center">
          <div className="glass-morphism rounded-full px-8 py-4">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link
                href="/"
                className="font-logo text-xl font-semibold text-text hover:text-sky-400 transition-colors duration-150"
              >
                Rishi Jha
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative font-nav text-sm font-medium transition-colors duration-150 group ${pathname === item.href
                      ? 'text-sky-400'
                      : 'text-muted hover:text-sky-400'
                      }`}
                  >
                    {item.label}
                    {/* Active indicator */}
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-400 rounded-full"
                        transition={{ duration: 0.15 }}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 md:hidden transition-opacity duration-150">
        <div className="glass-morphism rounded-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Logo */}
            <Link
              href="/"
              className="font-logo text-lg font-semibold text-text hover:text-sky-400 transition-colors duration-150"
            >
              Rishi Jha
            </Link>

            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full text-muted hover:text-text transition-colors duration-150 hover:bg-secondary/50"
                aria-label="Toggle menu"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
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
                      className={`font-nav text-sm font-medium transition-colors duration-150 ${pathname === item.href
                        ? 'text-sky-400'
                        : 'text-muted hover:text-sky-400'
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