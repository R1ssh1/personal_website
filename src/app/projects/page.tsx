'use client'

// NOTE: This page displays projects from BOTH sources:
// 1. Static MDX files (content/projects/*.mdx)
// 2. Database records (via /api/projects endpoint)
// See .github/copilot-instructions.md for MDX + Database sync pattern

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
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        My Projects
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A collection of projects I&apos;ve worked on, showcasing my skills in various technologies
                        and my passion for creating innovative solutions.
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg">
                            No projects found. Check back soon for updates!
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <div key={project.id}>
                                <ProjectCard project={project} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

