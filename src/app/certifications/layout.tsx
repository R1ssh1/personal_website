import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Certifications',
    description: 'Professional certifications and credentials verifying my technical skills and knowledge.',
}

export default function CertificationsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
