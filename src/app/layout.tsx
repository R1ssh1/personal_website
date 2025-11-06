'use client'

import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Navigation } from '@/components/Navigation'
import { Beams } from '@/components/reactbits/Beams'
// Beams component removed - will be reimplemented with proper TS+Tailwind

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-nav',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-logo',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-nav">
        <ThemeProvider>
          {/* Add Beams background */}
          <div className="fixed inset-0 -z-10">
            <Beams />
          </div>
          <Navigation />
          <main className="relative z-10">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
