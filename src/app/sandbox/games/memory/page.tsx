import MemoryCardGame from '@/components/playground/MemoryCardGame'
import { ClientOnly } from '@/components/ClientOnly'
import Link from 'next/link'

export default function MemoryCardGamePage() {
  return (
    <div className="min-h-screen pt-32 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/sandbox"
          className="inline-flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <span>←</span>
          <span>Back to Sandbox</span>
        </Link>

        <ClientOnly fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading Memory Card Game...</p>
            </div>
          </div>
        }>
          <MemoryCardGame />
        </ClientOnly>
      </div>
    </div>
  )
}