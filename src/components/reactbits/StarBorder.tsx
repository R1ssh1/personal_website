'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StarBorderProps {
  children: React.ReactNode
  className?: string
  speed?: number // loop duration in seconds
  starColor?: string
}

export const StarBorder: React.FC<StarBorderProps> = ({
  children,
  className = '',
  speed = 6, // slow loop - 6 seconds
  starColor = 'rgba(59, 130, 246, 0.7)', // blue/cyan theme
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Animated stars traveling around border */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
        {/* Star 1 */}
        <motion.circle
          cx="0"
          cy="0"
          r="1.5"
          fill={starColor}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 0.8, 0.8, 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1], // easeInOut for smooth corners
            delay: 0,
          }}
          style={{
            offsetPath: `path('M 0,8 L ${300},8 L ${300},${40} L 0,${40} Z')`,
            offsetRotate: '0deg',
          }}
        />

        {/* Star 2 */}
        <motion.circle
          cx="0"
          cy="0"
          r="1.5"
          fill={starColor}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
            delay: speed * 0.33,
          }}
          style={{
            offsetPath: `path('M 0,8 L ${300},8 L ${300},${40} L 0,${40} Z')`,
            offsetRotate: '0deg',
          }}
        />

        {/* Star 3 */}
        <motion.circle
          cx="0"
          cy="0"
          r="1.5"
          fill={starColor}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
            delay: speed * 0.66,
          }}
          style={{
            offsetPath: `path('M 0,8 L ${300},8 L ${300},${40} L 0,${40} Z')`,
            offsetRotate: '0deg',
          }}
        />
      </svg>
    </div>
  )
}
