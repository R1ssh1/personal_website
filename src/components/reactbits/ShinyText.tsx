'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ShinyTextProps {
  text: string
  className?: string
  pulseInterval?: number // in milliseconds
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  className = '',
  pulseInterval = 10000, // 10 seconds default
}) => {
  const [key, setKey] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1)
    }, pulseInterval)

    return () => clearInterval(interval)
  }, [pulseInterval])

  return (
    <motion.span
      key={key}
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{
        duration: 0.8,
        ease: 'easeOut',
      }}
    >
      <span className="relative z-10">{text}</span>
      <motion.span
        className="absolute inset-0 z-0"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          delay: 0.2,
        }}
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.6) 50%, transparent 100%)',
          filter: 'blur(8px)',
        }}
      />
    </motion.span>
  )
}
