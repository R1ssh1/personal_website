'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BlogMetadata } from '@/lib/mdx'
import { BlogPost } from '@/types'

interface BlogCardProps {
    post: BlogMetadata | BlogPost
}

// Type guard to check if post is from database
function isDatabasePost(post: BlogMetadata | BlogPost): post is BlogPost {
    return 'id' in post
}

export function BlogCard({ post }: BlogCardProps) {
    // Map database post to display format
    const displayPost = isDatabasePost(post) ? {
        title: post.title,
        summary: post.excerpt,
        date: post.publishDate,
        slug: post.id,
        tags: post.tags,
        readTime: undefined, // Not available in database schema
        featured: undefined // Not available in database schema
    } : post

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link href={isDatabasePost(post) ? `/blog/db/${post.id}` : `/blog/${post.slug}`}>
                <article className="h-full p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between mb-3">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {displayPost.title}
                        </h2>
                        {!isDatabasePost(post) && post.featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex-shrink-0 ml-2">
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {displayPost.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {displayPost.tags.map((tag: string) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={displayPost.date}>
                            {new Date(displayPost.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                        {displayPost.readTime && (
                            <span>{displayPost.readTime}</span>
                        )}
                    </div>
                </article>
            </Link>
        </motion.div>
    )
}

