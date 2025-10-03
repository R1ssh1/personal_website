import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mind Palace - Rishi Jha',
    description: 'Thoughts, musings, and technical insights from my journey in software development and computer science.',
}

export default function MindPalaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}