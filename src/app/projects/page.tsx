'use client'

// NOTE: This page displays projects from BOTH sources:
// 1. Static MDX files (content/projects/*.mdx)
// 2. Database records (via /api/projects endpoint)
// See .github/copilot-instructions.md for MDX + Database sync pattern

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'

// Tint colors for variety - cycles through projects
const tintColors = [
    'rgba(139, 92, 246, 0.15)',  // Purple
    'rgba(59, 130, 246, 0.15)',  // Blue
    'rgba(16, 185, 129, 0.15)',  // Green
    'rgba(245, 158, 11, 0.15)',  // Amber
    'rgba(236, 72, 153, 0.15)',  // Pink
    'rgba(6, 182, 212, 0.15)',   // Cyan
]

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTech, setSelectedTech] = useState<string | null>(null)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects')
            if (!response.ok) {
                throw new Error('Failed to fetch projects')
            }
            const data = await response.json()
            setProjects(data.projects || [])
        } catch (error) {
            console.error('Error fetching projects:', error)
            setError('Failed to load projects')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400 mx-auto mb-4"></div>
                        <p className="text-white/60">Loading projects...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen pt-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <p className="text-red-400 text-lg">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              project.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTech = selectedTech ? project.techStack.includes(selectedTech) : true;
        return matchesSearch && matchesTech;
    });

    // Extract all unique technologies for the filter
    const allTech = Array.from(new Set(projects.flatMap(p => p.techStack))).sort();

    return (
        <div className="min-h-screen pt-32 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        <span className="text-sky-400">My</span> Projects
                    </h1>
                    <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                        A collection of projects I&apos;ve worked on, showcasing my skills in various technologies
                        and my passion for creating innovative solutions.
                    </p>
                </motion.div>

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="max-w-xl mx-auto mb-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search projects by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/80 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {allTech.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                            <button
                                onClick={() => setSelectedTech(null)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    selectedTech === null 
                                    ? 'bg-sky-400 text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                }`}
                            >
                                All Technologies
                            </button>
                            {allTech.map(tech => (
                                <button
                                    key={tech}
                                    onClick={() => setSelectedTech(tech)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        selectedTech === tech 
                                        ? 'bg-sky-400 text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.4)]' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                                    }`}
                                >
                                    {tech}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="glass-morphism rounded-2xl p-12 max-w-md mx-auto">
                            <p className="text-white/60 text-lg">
                                No projects found. Check back soon for updates!
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProjects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                tintColor={tintColors[index % tintColors.length]}
                            />
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

