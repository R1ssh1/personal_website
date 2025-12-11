import MemoryCardGame from '@/components/playground/MemoryCardGame'
import { ClientOnly } from '@/components/ClientOnly'
import Link from 'next/link'

export default function MemoryCardGamePage() {
  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/sandbox"
          className="inline-flex items-center space-x-2 text-white/60 hover:text-sky-400 transition-colors mb-8"
        >
          <span>←</span>
          <span>Back to Sandbox</span>
        </Link>

        <div className="glass-morphism rounded-2xl p-6 border border-white/10">
          <ClientOnly fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
                <p className="text-white/60">Loading Memory Card Game...</p>
              </div>
            </div>
          }>
            <MemoryCardGame />
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}