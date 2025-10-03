'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BlogPost } from '@/types'
import { createSlug } from '@/lib/slug'

export default function MindPalace() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [searchTerm, setSearchTerm] = useState("")
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
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        return matchesCategory && matchesSearch && post.published
    })

    return (
        <div className="min-h-screen pt-24 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-xl text-muted">Loading blog posts...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-xl text-red-500">{error}</div>
                    </div>
                )}

                {/* Content - only show when not loading and no error */}
                {!isLoading && !error && (
                    <>
                        {/* Header */}
                        <motion.div
                            className="text-center mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.h1
                                className="text-4xl md:text-6xl font-bold text-text mb-6"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <span className="text-accent">Mind</span> Palace
                            </motion.h1>

                            <motion.p
                                className="text-xl text-muted max-w-2xl mx-auto mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                A collection of thoughts, technical insights, and musings from my journey
                                in software development and computer science.
                            </motion.p>

                            {/* Fun brain icon */}
                            <motion.div
                                className="flex justify-center mb-8"
                                initial={{ opacity: 0, rotate: -180 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                transition={{ duration: 1, delay: 0.6, type: "spring" }}
                            >
                                <div className="text-6xl">🧠</div>
                            </motion.div>
                        </motion.div>

                        {/* Search and Filter */}
                        <motion.div
                            className="mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            {/* Search Bar */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="Search thoughts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full max-w-md mx-auto block px-6 py-3 glass-morphism border border-secondary/20 rounded-xl focus:border-accent/50 focus:outline-none transition-all duration-300 text-text placeholder-muted"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map((category) => (
                                    <motion.button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${selectedCategory === category
                                            ? 'bg-accent text-white shadow-lg'
                                            : 'glass-morphism text-muted hover:text-accent border border-secondary/20 hover:border-accent/30'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
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
                                        delayChildren: 1
                                    }
                                }
                            }}
                        >
                            {filteredPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${createSlug(post.title)}`}>
                                    <motion.article
                                        className="glass-morphism border border-secondary/20 rounded-2xl p-6 hover:border-accent/30 transition-all duration-300 group cursor-pointer"
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 }
                                        }}
                                        whileHover={{
                                            scale: 1.02,
                                            y: -4,
                                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Category Badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                                                {post.tags && post.tags.length > 0 ? post.tags[0] : 'Blog'}
                                            </span>
                                            <span className="text-sm text-muted">
                                                {new Date(post.publishDate || post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold text-text mb-3 group-hover:text-accent transition-colors duration-300">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <p className="text-muted mb-4 leading-relaxed">
                                            {post.excerpt}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-1 bg-secondary/10 text-muted text-xs rounded-lg"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Date and Read More */}
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted">
                                                {new Date(post.publishDate || post.createdAt).toLocaleDateString()}
                                            </span>
                                            <motion.span
                                                className="text-accent flex items-center gap-1 group-hover:gap-2 transition-all duration-300"
                                            >
                                                Read More
                                                <motion.span
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                >
                                                    →
                                                </motion.span>
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
                                <div className="text-6xl mb-4">🤔</div>
                                <h3 className="text-xl font-bold text-text mb-2">No thoughts found</h3>
                                <p className="text-muted">Try adjusting your search or filter criteria</p>
                            </motion.div>
                        )}

                        {/* Coming Soon Note */}
                        <motion.div
                            className="text-center py-12 border-t border-secondary/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.2 }}
                        >
                            <div className="glass-morphism border border-secondary/20 rounded-2xl p-8 max-w-2xl mx-auto">
                                <div className="text-4xl mb-4">🚀</div>
                                <h3 className="text-xl font-bold text-text mb-3">More Thoughts Coming Soon</h3>
                                <p className="text-muted mb-6">
                                    I&apos;m constantly learning and exploring new ideas. Check back regularly for fresh insights
                                    on software development, design, and technology.
                                </p>
                                <Link
                                    href="/contact"
                                    className="inline-block px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl transition-all duration-300 font-medium"
                                >
                                    Suggest a Topic
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    )
}