import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Admin area for managing content.',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
