'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark']}
      disableTransitionOnChange={false}
      {...props}
    >
      <div className="starry-bg bg-primary text-text min-h-screen transition-colors duration-300">
        {children}
      </div>
    </NextThemesProvider>
  )
}
