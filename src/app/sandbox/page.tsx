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
    icon: React.ReactNode
    items: SandboxItem[]
}> = [
        {
            title: 'Dev Games',
            description: 'Test your coding skills with interactive challenges',
            icon: (
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
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
            icon: (
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            items: [
                { name: 'Pixel Art Drawer', status: 'available', description: 'Create pixel art with programming color palettes', link: '/sandbox/tools/pixel-art' },
                { name: 'Algorithm Visualizer', status: 'available', description: 'Interactive sorting and searching animations', link: '/sandbox/tools/algorithms' },
                { name: 'Data Visualization Tool', status: 'available', description: 'Upload Excel/CSV files and create interactive charts', link: '/sandbox/tools/data-viz' }
            ]
        }
    ]

// Tint colors for sections
const sectionTints = [
    'rgba(245, 158, 11, 0.1)',  // Amber
    'rgba(236, 72, 153, 0.1)',  // Pink
    'rgba(56, 189, 248, 0.1)',  // Sky
]

export default function SandboxPage() {
    return (
        <div className="min-h-screen pt-32 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        The <span className="text-sky-400">Sandbox</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Where ideas come to play. Interactive games, creative tools, and professional showcases
                        designed to entertain and inspire developers.
                    </p>
                </motion.div>

                {/* Sections Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {sandboxSections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            className="glass-morphism rounded-xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
                            style={{ background: `linear-gradient(135deg, ${sectionTints[index]}, transparent)` }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            {/* Section Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
                                <p className="text-white/60">{section.description}</p>
                            </div>

                            {/* Items List */}
                            <div className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <motion.div
                                        key={item.name}
                                        className={`p-4 bg-white/5 rounded-xl border border-white/10 transition-all duration-300 ${item.status === 'available'
                                            ? 'hover:border-sky-500/30 cursor-pointer hover:bg-sky-500/10'
                                            : 'hover:border-white/20'
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
                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${item.status === 'available'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : item.status === 'coming-soon'
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-white/10 text-white/50 border border-white/10'
                                                }`}>
                                                {item.status === 'available' && 'Play Now'}
                                                {item.status === 'coming-soon' && 'Coming Soon'}
                                                {item.status === 'future' && 'Future'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/60">{item.description}</p>
                                        {item.status === 'available' && (
                                            <p className="text-xs text-sky-400 mt-2 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                                Click to play
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action */}
                <motion.div
                    className="text-center glass-morphism rounded-xl p-8 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h3>
                    <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                        The Sandbox is actively being developed. Each tool and game is crafted with attention to detail,
                        smooth animations, and an exceptional user experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/projects"
                            className="px-6 py-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-xl transition-all duration-300 font-medium border border-sky-500/30 hover:scale-105"
                        >
                            View My Projects
                        </Link>
                        <Link
                            href="/about"
                            className="px-6 py-3 glass-morphism text-white hover:text-sky-400 border border-white/10 hover:border-sky-500/30 rounded-xl transition-all duration-300 font-medium"
                        >
                            Learn About Me
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}