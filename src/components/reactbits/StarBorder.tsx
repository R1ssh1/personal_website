'use client'

import React, { useState } from 'react';

type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
};

export const StarBorder = <T extends React.ElementType = 'div'>({
  as,
  className = '',
  color = 'rgba(59, 130, 246, 0.7)',
  speed = '3s',
  thickness = 0.5,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'div';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Component
      className={`group relative inline-block overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style
      }}
    >
      <div
        className="absolute w-[300%] h-[30%] bottom-[-11px] right-[-250%] rounded-full z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-bottom ${isHovered ? '1.5s' : '3s'} ease-in-out infinite alternate`,
          opacity: isHovered ? 1 : 0.7
        }}
      />
      <div
        className="absolute w-[300%] h-[30%] top-[-10px] left-[-250%] rounded-full z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-top ${isHovered ? '1.5s' : '3s'} ease-in-out infinite alternate`,
          opacity: isHovered ? 1 : 0.7
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};