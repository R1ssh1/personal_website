'use client'

import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = ''
}) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        background:
          'linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,1.5) 50%, rgba(255,255,255,0.6) 60%, rgba(255,255,255,1) 70%, rgba(255,255,255,1) 100%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        animationDuration: animationDuration,
        minHeight: '85px',
        lineHeight: '1.2'
      }}
    >
      {text}
    </div>
  );
};