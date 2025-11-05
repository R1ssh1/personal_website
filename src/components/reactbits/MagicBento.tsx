'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface MagicBentoProps {
  children: React.ReactNode
  className?: string
  glowColors?: string[]
  speed?: number // animation duration in seconds
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = '',
  glowColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'], // blue, purple, pink, green
  speed = 8, // slow ambient glow - 8 seconds
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      
      {/* Animated border glow - only visible on hover */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '1px',
          background: `linear-gradient(90deg, ${glowColors.join(', ')})`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `linear-gradient(0deg, ${glowColors.join(', ')})`,
              `linear-gradient(90deg, ${glowColors.join(', ')})`,
              `linear-gradient(180deg, ${glowColors.join(', ')})`,
              `linear-gradient(270deg, ${glowColors.join(', ')})`,
              `linear-gradient(360deg, ${glowColors.join(', ')})`,
            ],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    </div>
  )
}
