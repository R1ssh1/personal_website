'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlareHoverProps {
  children: React.ReactNode
  className?: string
  intensity?: 'subtle' | 'moderate' | 'prominent'
  duration?: number
}

export const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  className = '',
  intensity = 'subtle',
  duration = 0.35,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const intensityValues = {
    subtle: 0.12,
    moderate: 0.2,
    prominent: 0.35,
  }

  const glareOpacity = intensityValues[intensity]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setGlarePosition({ x, y })
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? glareOpacity : 0 }}
        transition={{ duration }}
        style={{
          background: `radial-gradient(circle 400px at ${glarePosition.x}% ${glarePosition.y}%, rgba(59, 130, 246, 0.4), transparent 40%)`,
        }}
      />
    </div>
  )
}
