import { getUsesContent } from '@/lib/mdx'
import { MDXContent } from '@/components/MDXContent'

export const metadata = {
    title: 'Uses - Rishi Jha',
    description: 'A detailed list of the software, hardware, and tools I use for development and daily work.',
}

export default function UsesPage() {
    const usesData = getUsesContent()

    if (!usesData) {
        return (
            <div className="min-h-screen pt-32 px-4 bg-background">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-6">
                        What I Use
                    </h1>
                    <p className="text-muted-foreground">
                        Content coming soon...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                    <MDXContent content={usesData.content} />
                </article>
            </div>
        </div>
    )
}

