import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Metadata } from 'next'

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

export const metadata: Metadata = {
  title: {
    template: '%s | Rishi Jha',
    default: 'Rishi Jha | Software Developer',
  },
  description: 'Software Developer & CSE Graduate building full-stack web applications.',
  icons: {
    icon: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${playfair.variable}`}>
      <body className="font-nav">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
