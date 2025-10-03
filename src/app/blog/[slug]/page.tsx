import { notFound } from 'next/navigation'
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/mdx'
import { MDXContent } from '@/components/MDXContent'
import Link from 'next/link'
import { getBlogSlugFromTitle } from '@/lib/slug'
import { blogPostsDb } from '@/lib/database'

// Extended blog post type to handle both MDX and database content
interface BlogPostData {
    title: string
    summary: string
    content: string
    date: string
    tags: string[]
    readTime?: string
    featured?: boolean
    type: 'mdx' | 'database'
}

async function fetchBlogPost(slug: string): Promise<BlogPostData | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/blogs/${slug}`)
        if (response.ok) {
            const data = await response.json()
            return data.success ? data.blog : null
        }
    } catch (error) {
        console.error('Error fetching blog post:', error)
    }
    return null
}

export async function generateStaticParams() {
    // Get both MDX and database blog posts
    const mdxPosts = getAllBlogPosts()
    const dbPosts = blogPostsDb.getAll()

    const mdxSlugs = mdxPosts.map((post) => ({ slug: post.slug }))
    const dbSlugs = dbPosts.map((post) => ({ slug: getBlogSlugFromTitle(post.title) }))

    return [...mdxSlugs, ...dbSlugs]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await fetchBlogPost(slug)

    if (!post) {
        return {
            title: 'Post Not Found',
        }
    }

    return {
        title: `${post.title} - Your Name`,
        description: post.summary,
    }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const post = await fetchBlogPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Blog
                </Link>

                {/* Post Header */}
                <header className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                            {post.title}
                        </h1>
                        {post.featured && (
                            <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                        {post.summary}
                    </p>

                    {/* Post Meta */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                        {post.readTime && (
                            <span>{post.readTime}</span>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag: string) => (
                            <span
                                key={tag}
                                className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Post Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    {post.type === 'mdx' ? (
                        <MDXContent content={post.content} />
                    ) : (
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    )}
                </article>
            </div>
        </div>
    )
}

