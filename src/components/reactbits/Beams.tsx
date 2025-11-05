'use client'

import React from 'react'
import { motion } from 'framer-motion'

export const Beams = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Noise filter for texture - slightly lower than default */}
          <filter id="beamNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="saturate"
              values="0"
            />
          </filter>

          {/* Gradient for beams - very light sky-blue */}
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(135, 206, 250, 0)" />
            <stop offset="30%" stopColor="rgba(135, 206, 250, 0.15)" />
            <stop offset="50%" stopColor="rgba(135, 206, 250, 0.25)" />
            <stop offset="70%" stopColor="rgba(135, 206, 250, 0.15)" />
            <stop offset="100%" stopColor="rgba(135, 206, 250, 0)" />
          </linearGradient>
        </defs>

        {/* Beam 1 */}
        <motion.rect
          x="-50%"
          y="-50%"
          width="200%"
          height="4"
          fill="url(#beamGradient)"
          filter="url(#beamNoise)"
          transform="rotate(25)"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.4, 0.4, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: 0,
          }}
        />

        {/* Beam 2 */}
        <motion.rect
          x="-50%"
          y="20%"
          width="200%"
          height="3"
          fill="url(#beamGradient)"
          filter="url(#beamNoise)"
          transform="rotate(25)"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.35, 0.35, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.5,
          }}
        />

        {/* Beam 3 */}
        <motion.rect
          x="-50%"
          y="60%"
          width="200%"
          height="5"
          fill="url(#beamGradient)"
          filter="url(#beamNoise)"
          transform="rotate(25)"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.45, 0.45, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 3,
          }}
        />

        {/* Beam 4 - thinner, faster */}
        <motion.rect
          x="-50%"
          y="40%"
          width="200%"
          height="2"
          fill="url(#beamGradient)"
          filter="url(#beamNoise)"
          transform="rotate(25)"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 2.5,
          }}
        />

        {/* Beam 5 - slower, wider */}
        <motion.rect
          x="-50%"
          y="80%"
          width="200%"
          height="6"
          fill="url(#beamGradient)"
          filter="url(#beamNoise)"
          transform="rotate(25)"
          initial={{ x: '-100%', opacity: 0 }}
          animate={{
            x: ['0%', '100%'],
            opacity: [0, 0.5, 0.5, 0],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 4,
          }}
        />
      </svg>
    </div>
  )
}
