import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact - Rishi Jha',
    description: 'Get in touch with me for collaboration opportunities, questions, or just to say hello.',
}

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}