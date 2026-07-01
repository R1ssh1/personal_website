'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ProjectMetadata } from '@/lib/mdx'
import { Project } from '@/types'
import { getProjectSlugFromTitle } from '@/lib/slug'

interface ProjectCardProps {
    project: ProjectMetadata | Project
    tintColor?: string
}

// Type guard to check if project is from database
function isDatabaseProject(project: ProjectMetadata | Project): project is Project {
    return 'id' in project
}

export function ProjectCard({ project, tintColor }: ProjectCardProps) {
    // Map database project to display format
    const displayProject = isDatabaseProject(project) ? {
        title: project.title,
        summary: project.description,
        technologies: project.techStack,
        slug: getProjectSlugFromTitle(project.title),
        github: project.githubLink,
        demo: project.liveDemoLink,
        image: project.images?.[0] || null
    } : project

    const defaultTint = 'rgba(139, 92, 246, 0.1)' // Purple tint
    const cardTint = tintColor || defaultTint

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group h-full"
        >
            <Link href={`/projects/${displayProject.slug}`}>
                <div
                    className="h-full flex flex-col glass-morphism rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-150"
                    style={{ background: `linear-gradient(135deg, ${cardTint}, transparent)` }}
                >
                    {/* Image Section */}
                    {displayProject.image && (
                        <div className="relative overflow-hidden">
                            <img
                                src={displayProject.image}
                                alt={displayProject.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col p-6">
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-sky-400 transition-colors line-clamp-2">
                            {displayProject.title}
                        </h3>

                        {/* Description */}
                        <p className="text-white/60 text-sm mb-4 line-clamp-3 flex-grow">
                            {typeof displayProject.summary === 'string'
                                ? displayProject.summary.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
                                : displayProject.summary}
                        </p>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {displayProject.technologies.slice(0, 4).map((tech: string) => (
                                <span
                                    key={tech}
                                    className="px-3 py-1 text-xs font-medium bg-white/10 text-white/80 rounded-full border border-white/10"
                                >
                                    {tech}
                                </span>
                            ))}
                            {displayProject.technologies.length > 4 && (
                                <span className="px-3 py-1 text-xs font-medium text-white/50">
                                    +{displayProject.technologies.length - 4} more
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-auto">
                            {displayProject.github && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        window.open(displayProject.github, '_blank', 'noopener,noreferrer')
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-150 hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
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
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 rounded-xl text-sky-400 font-medium transition-all duration-150 hover:scale-105"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Demo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

