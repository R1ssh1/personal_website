'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { ProjectCard } from '@/components/ProjectCard'

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
            <div className="min-h-screen pt-32 px-4 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading projects...</p>
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
                        My Projects
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A collection of projects I&apos;ve worked on, showcasing my skills in various technologies
                        and my passion for creating innovative solutions.
                    </p>
                </motion.div>

                {projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <p className="text-muted-foreground text-lg">
                            No projects found. Check back soon for updates!
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <ProjectCard project={project} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

