'use client'

import { useEffect, useState } from 'react'

interface MousePosition {
  x: number
  y: number
}

export default function MouseGradient() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Gradient that follows mouse */}
      <div
        className={`absolute w-96 h-96 rounded-full transition-all duration-300 ease-out ${isVisible ? 'opacity-20' : 'opacity-0'
          }`}
        style={{
          left: mousePosition.x - 192, // Half of w-96 (384px / 2)
          top: mousePosition.y - 192,
          background: `radial-gradient(circle, 
            rgba(147, 51, 234, 0.3) 0%, 
            rgba(59, 130, 246, 0.2) 25%, 
            rgba(16, 185, 129, 0.1) 50%, 
            transparent 70%
          )`,
          filter: 'blur(40px)',
        }}
      />

      {/* Secondary smaller gradient for more depth */}
      <div
        className={`absolute w-64 h-64 rounded-full transition-all duration-200 ease-out ${isVisible ? 'opacity-30' : 'opacity-0'
          }`}
        style={{
          left: mousePosition.x - 128, // Half of w-64 (256px / 2)
          top: mousePosition.y - 128,
          background: `radial-gradient(circle, 
            rgba(236, 72, 153, 0.4) 0%, 
            rgba(168, 85, 247, 0.2) 40%, 
            transparent 70%
          )`,
          filter: 'blur(20px)',
        }}
      />
    </div>
  )
}