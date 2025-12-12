'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BlogPost } from '@/types'
import { createSlug } from '@/lib/slug'

// Tint colors for blog cards
const tintColors = [
    'rgba(139, 92, 246, 0.15)',  // Purple
    'rgba(59, 130, 246, 0.15)',  // Blue
    'rgba(16, 185, 129, 0.15)',  // Green
    'rgba(245, 158, 11, 0.15)',  // Amber
    'rgba(236, 72, 153, 0.15)',  // Pink
    'rgba(6, 182, 212, 0.15)',   // Cyan
]

export default function MindPalace() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [selectedCategory, setSelectedCategory] = useState("All")
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
            setBlogPosts(data.success ? data.blogs : data)
        } catch (error) {
            console.error('Error fetching blog posts:', error)
            setError('Failed to load blog posts')
        } finally {
            setIsLoading(false)
        }
    }

    // Extract unique categories from blog posts
    const categories = ["All", ...Array.from(new Set(
        blogPosts.flatMap(post => post.tags || [])
    ))]

    const filteredPosts = blogPosts.filter(post => {
        const matchesCategory = selectedCategory === "All" || (post.tags && post.tags.includes(selectedCategory))
        return matchesCategory && post.published
    })

    return (
        <div className="min-h-screen pt-32 px-4">
            <div className="w-[85%] mx-auto">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="inline-block w-10 h-10 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="glass-morphism rounded-2xl p-8 border border-red-500/20">
                            <p className="text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                    <>
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                                <span className="text-sky-400">Mind</span> Palace
                            </h1>
                            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                                A collection of my thoughts, technical writings, and insights on software development and technology.
                            </p>
                        </motion.div>

                        {/* Category Filter */}
                        <motion.div
                            className="mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map((category) => (
                                    <motion.button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-6 py-2 rounded-full transition-all duration-150 font-medium ${selectedCategory === category
                                            ? 'bg-sky-500/30 text-sky-400 border border-sky-500/30'
                                            : 'glass-morphism text-white/60 hover:text-sky-400 border border-white/10 hover:border-sky-500/30'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.15 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {category}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Blog Posts Grid */}
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1,
                                        delayChildren: 0.8
                                    }
                                }
                            }}
                        >
                            {filteredPosts.map((post, index) => (
                                <Link key={post.id} href={`/blog/${createSlug(post.title)}`}>
                                    <motion.article
                                        className="h-full glass-morphism border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-150 group cursor-pointer"
                                        style={{ background: `linear-gradient(135deg, ${tintColors[index % tintColors.length]}, transparent)` }}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{
                                            scale: 1.02,
                                            y: -4
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Category Badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-sm font-medium border border-sky-500/30">
                                                {post.tags && post.tags.length > 0 ? post.tags[0] : 'Blog'}
                                            </span>
                                            <span className="text-sm text-white/50">
                                                {new Date(post.publishDate || post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors duration-150">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <p className="text-white/60 mb-4 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-lg border border-white/10"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="px-2 py-1 text-white/40 text-xs">
                                                    +{post.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>

                                        {/* Read More */}
                                        <div className="flex items-center justify-end text-sm">
                                            <motion.span
                                                className="text-sky-400 flex items-center gap-1 group-hover:gap-2 transition-all duration-150"
                                            >
                                                Read More
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </motion.span>
                                        </div>
                                    </motion.article>
                                </Link>
                            ))}
                        </motion.div>

                        {/* Empty State */}
                        {filteredPosts.length === 0 && (
                            <motion.div
                                className="text-center py-16"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="glass-morphism rounded-2xl p-12 max-w-md mx-auto border border-white/10">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No thoughts found</h3>
                                    <p className="text-white/60">Try selecting a different category</p>
                                </div>
                            </motion.div>
                        )}


                    </>
                )}
            </div>
        </div>
    )
}