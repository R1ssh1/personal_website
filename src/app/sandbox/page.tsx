'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface SandboxItem {
    name: string
    status: 'available' | 'coming-soon' | 'future'
    description: string
    link?: string
}

const sandboxSections: Array<{
    title: string
    description: string
    icon: string
    items: SandboxItem[]
}> = [
        {
            title: 'Dev Games',
            description: 'Test your coding skills with interactive challenges',
            icon: '⚡',
            items: [
                { name: 'Snake Game', status: 'available', description: 'Classic snake with smooth controls and scoring', link: '/sandbox/games/snake' },
                { name: '2048 Game', status: 'available', description: 'Slide numbered tiles to reach 2048', link: '/sandbox/games/2048' },
                { name: 'Code Typing Challenge', status: 'available', description: 'Measure your coding WPM with syntax highlighting', link: '/sandbox/challenges/typing' },
                { name: 'Memory Card Game', status: 'available', description: 'Match programming concepts and tech logos', link: '/sandbox/games/memory' }
            ]
        },
        {
            title: 'Creative Tools',
            description: 'Interactive design and visualization experiences',
            icon: '🎨',
            items: [
                { name: 'Pixel Art Drawer', status: 'available', description: 'Create pixel art with programming color palettes', link: '/sandbox/tools/pixel-art' },
                { name: 'Algorithm Visualizer', status: 'available', description: 'Interactive sorting and searching animations', link: '/sandbox/tools/algorithms' },
                { name: 'Data Visualization Tool', status: 'available', description: 'Upload Excel/CSV files and create interactive charts', link: '/sandbox/tools/data-viz' }
            ]
        },
        {
            title: 'AI & Advanced',
            description: 'Professional showcases and future technologies',
            icon: '🛠️',
            items: [
                { name: 'AI Chatbot', status: 'future', description: 'Smart assistant trained on portfolio knowledge' },
                { name: 'Code Generator', status: 'future', description: 'Generate boilerplate code for common patterns' },
                { name: 'API Testing Tool', status: 'future', description: 'Test REST APIs with an interactive interface' }
            ]
        }
    ]

export default function SandboxPage() {
    return (
        <div className="min-h-screen pt-32 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                        🏖️ The Sandbox
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Where ideas come to play. Interactive games, creative tools, and professional showcases
                        designed to entertain and inspire developers.
                    </p>
                </motion.div>

                {/* Sections Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-16">
                    {sandboxSections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            className="bg-secondary/50 rounded-xl p-8 hover:bg-secondary/70 transition-all duration-300"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {/* Section Header */}
                            <div className="text-center mb-8">
                                <div className="text-4xl mb-4">{section.icon}</div>
                                <h2 className="text-2xl font-bold text-foreground mb-3">{section.title}</h2>
                                <p className="text-muted-foreground">{section.description}</p>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <motion.div
                                        key={item.name}
                                        className={`p-4 bg-background/50 rounded-lg border border-secondary/20 transition-all duration-300 ${item.status === 'available'
                                                ? 'hover:border-accent/30 cursor-pointer hover:bg-accent/5'
                                                : 'hover:border-accent/30'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: (index * 0.1) + (itemIndex * 0.05) }}
                                        onClick={() => {
                                            if (item.status === 'available' && item.link) {
                                                window.location.href = item.link
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.status === 'available'
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : item.status === 'coming-soon'
                                                        ? 'bg-accent/10 text-accent border border-accent/20'
                                                        : 'bg-muted/20 text-muted border border-muted/20'
                                                }`}>
                                                {item.status === 'available' && '✨ Play Now'}
                                                {item.status === 'coming-soon' && 'Coming Soon'}
                                                {item.status === 'future' && 'Future'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        {item.status === 'available' && (
                                            <p className="text-xs text-accent mt-2">→ Click to play!</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    className="text-center bg-accent/5 rounded-xl p-8 border border-accent/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3 className="text-2xl font-bold text-foreground mb-4">Ready to Explore?</h3>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                        The Sandbox is actively being developed. Each tool and game is crafted with attention to detail,
                        smooth animations, and an exceptional user experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/projects"
                            className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg transition-all duration-300 font-medium"
                        >
                            View My Projects
                        </Link>
                        <Link
                            href="/about"
                            className="px-6 py-3 glass-morphism text-foreground hover:text-accent border border-secondary/20 hover:border-accent/30 rounded-lg transition-all duration-300 font-medium"
                        >
                            Learn About Me
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}