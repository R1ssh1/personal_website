import Link from 'next/link'
import DataVisualizationTool from '@/components/playground/DataVisualizationTool'

export default function DataVisualizationPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/sandbox"
            className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Sandbox
          </Link>
        </div>

        <DataVisualizationTool />
      </div>
    </div>
  )
}