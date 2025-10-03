'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BlogPost } from '@/types'
import { BlogCard } from '@/components/BlogCard'

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchBlogPosts()
    }, [])

    const fetchBlogPosts = async () => {
        try {
            const response = await fetch('/api/blogs')
            if (!response.ok) {
                throw new Error('Failed to fetch blog posts')
            }
            const data = await response.json()
            setPosts(data.blogs || [])
        } catch (error) {
            console.error('Error fetching blog posts:', error)
            setError('Failed to load blog posts')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading blog posts...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <p className="text-red-500 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-32 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Blog
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Thoughts on technology, software development, and my journey as a computer science student.
                    </p>
                </motion.div>

                {posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <p className="text-muted-foreground text-lg">
                            No blog posts yet. Check back soon for updates!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {posts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <BlogCard post={post} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

