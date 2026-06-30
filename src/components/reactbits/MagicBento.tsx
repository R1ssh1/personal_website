'use client'

import React, { useState } from 'react';

interface MagicBentoProps {
  children?: React.ReactNode;
  className?: string;
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rotating gradient border */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: isHovered ? 1 : 0,
          background: 'linear-gradient(60deg, #3b82f6, #8b5cf6, #ec4899, #10b981)',
          backgroundSize: '300% 300%',
          animation: isHovered ? 'gradient-rotate 8s linear infinite' : 'none',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}
      />
      {children}
      
      <style jsx>{`
        @keyframes gradient-rotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};