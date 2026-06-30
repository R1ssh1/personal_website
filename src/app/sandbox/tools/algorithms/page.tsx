import AlgorithmVisualizer from '@/components/playground/AlgorithmVisualizer'
import Link from 'next/link'

export default function AlgorithmVisualizerPage() {
  return (
    <div className="min-h-screen pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          href="/sandbox"
          className="inline-flex items-center space-x-2 text-white/60 hover:text-sky-400 transition-colors mb-8"
        >
          <span>←</span>
          <span>Back to Sandbox</span>
        </Link>

        <div className="glass-morphism rounded-2xl p-6 border border-white/10">
          <AlgorithmVisualizer />
        </div>
      </div>
    </div>
  )
}