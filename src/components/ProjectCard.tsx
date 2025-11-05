'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProjectMetadata } from '@/lib/mdx'
import { Project } from '@/types'
import { MagicBento } from '@/components/reactbits/MagicBento'

interface ProjectCardProps {
    project: ProjectMetadata | Project
}

// Type guard to check if project is from database
function isDatabaseProject(project: ProjectMetadata | Project): project is Project {
    return 'id' in project
}

export function ProjectCard({ project }: ProjectCardProps) {
    // Map database project to display format
    const displayProject = isDatabaseProject(project) ? {
        title: project.title,
        summary: project.description,
        technologies: project.techStack,
        date: project.createdAt,
        slug: project.id,
        github: project.githubLink,
        demo: project.liveDemoLink,
        image: project.images[0] // Use first image
    } : project

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5 }}
            className="group"
        >
            <Link href={isDatabaseProject(project) ? `/projects/db/${project.id}` : `/projects/${project.slug}`}>
                <MagicBento className="h-full">
                    <div className="h-full p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg bg-white dark:bg-gray-800">
                    {displayProject.image && (
                        <div className="mb-4 overflow-hidden rounded-lg">
                            <img
                                src={displayProject.image}
                                alt={displayProject.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {displayProject.title}
                        </h3>
                        {!isDatabaseProject(project) && project.featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {displayProject.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {displayProject.technologies.map((tech: string) => (
                            <span
                                key={tech}
                                className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>{new Date(displayProject.date).toLocaleDateString()}</span>
                        <div className="flex space-x-3">
                            {displayProject.github && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        window.open(displayProject.github, '_blank', 'noopener,noreferrer')
                                    }}
                                    className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                                >
                                    GitHub
                                </button>
                            )}
                            {displayProject.demo && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        window.open(displayProject.demo, '_blank', 'noopener,noreferrer')
                                    }}
                                    className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
                                >
                                    Demo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                </MagicBento>
            </Link>
        </motion.div>
    )
}

