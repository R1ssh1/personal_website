import PixelArtDrawer from '@/components/playground/PixelArtDrawer'
import Link from 'next/link'

export default function PixelArtPage() {
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

        <PixelArtDrawer />
      </div>
    </div>
  )
}