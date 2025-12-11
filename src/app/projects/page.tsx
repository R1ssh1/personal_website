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

    return (
        <div className="min-h-screen pt-32 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        My Projects
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        A collection of projects I&apos;ve worked on, showcasing my skills in various technologies
                        and my passion for creating innovative solutions.
                    </p>
                </motion.div>

                {projects.length === 0 ? (
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
                        {projects.map((project, index) => (
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

