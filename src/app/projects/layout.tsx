import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Projects',
    description: 'Explore my latest projects, technical work, and open-source contributions.',
}

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
