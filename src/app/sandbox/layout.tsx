import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'The Sandbox - Rishi Jha',
    description: 'Interactive games, creative tools, and professional showcases. A playground for developers and tech enthusiasts.',
}

export default function SandboxLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}