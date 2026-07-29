'use client'

import { ThemeProvider } from '@/components/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { Beams } from '@/components/reactbits/Beams'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="fixed inset-0 -z-10">
        <Beams />
      </div>
      <Navigation />
      <main className="relative z-10">
        {children}
      </main>
    </ThemeProvider>
  )
}
