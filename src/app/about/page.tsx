import { getAboutContent } from '@/lib/mdx'
import { aboutContentDb } from '@/lib/database-unified'
import { MDXContent } from '@/components/MDXContent'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
    title: 'About - Rishi Jha',
    description: 'Learn more about my background, skills, and interests in computer science and software development.',
}

export default async function AboutPage() {
    // Try to get content from database first (admin-editable)
    let dbContent = null
    try {
        dbContent = await aboutContentDb.get()
    } catch (error) {
        console.error('Database connection failed during build in about page:', error)
    }

    // Fallback to MDX if no database content
    const mdxData = getAboutContent()

    // Use DB content if available, otherwise use MDX
    const hasDbContent = dbContent && dbContent.content && dbContent.content.trim().length > 0
    const hasMdxContent = mdxData && mdxData.content

    if (!hasDbContent && !hasMdxContent) {
        return (
            <div className="min-h-screen pt-32 px-4 bg-background">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-6">
                        About Me
                    </h1>
                    <p className="text-muted-foreground">
                        Content coming soon...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 px-4">
            <div className="w-[85%] mx-auto">
                <div className="glass-morphism rounded-2xl p-8 border border-white/10">
                    <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-a:text-sky-400 prose-strong:text-white">
                        {hasDbContent ? (
                            // Render HTML content from database
                            <div dangerouslySetInnerHTML={{ __html: dbContent!.content }} />
                        ) : (
                            // Render MDX content as fallback
                            <MDXContent content={mdxData!.content} />
                        )}
                    </article>
                </div>
            </div>
        </div>
    )
}

