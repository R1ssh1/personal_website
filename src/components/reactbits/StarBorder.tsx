'use client'

import React from 'react';

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
  color = 'rgba(255, 149, 250, 1)',
  speed = '3s',
  thickness = 0.5,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'div';
  const [animationSpeed, setAnimationSpeed] = React.useState(speed);

  return (
    <Component
      className={`group relative inline-block overflow-hidden rounded-xl ${className}`}
      onMouseEnter={() => setAnimationSpeed('1.5s')}
      onMouseLeave={() => setAnimationSpeed(speed)}
      {...(rest as any)}
      style={{
        padding: `${thickness}px 0`,
        ...(rest as any).style
      }}
    >
      <div
        className="absolute w-[300%] h-[30%] opacity-70 group-hover:opacity-100 bottom-[-11px] right-[-250%] rounded-full z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-bottom ${animationSpeed} ease-in-out infinite alternate`,
        }}
      />
      <div
        className="absolute w-[300%] h-[30%] opacity-70 group-hover:opacity-100 top-[-10px] left-[-250%] rounded-full z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animation: `star-movement-top ${animationSpeed} ease-in-out infinite alternate`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </Component>
  );
};