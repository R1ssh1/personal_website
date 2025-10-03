import { getAboutContent } from '@/lib/mdx'
import { MDXContent } from '@/components/MDXContent'

export const metadata = {
    title: 'About - Rishi Jha',
    description: 'Learn more about my background, skills, and interests in computer science and software development.',
}

export default function AboutPage() {
    const aboutData = getAboutContent()

    if (!aboutData) {
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
        <div className="min-h-screen pt-32 px-4 bg-background">
            <div className="max-w-4xl mx-auto">
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground">
                    <MDXContent content={aboutData.content} />
                </article>
            </div>
        </div>
    )
}

