import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug } from '@/lib/mdx'
import { MDXContent } from '@/components/MDXContent'
import Link from 'next/link'
import { getProjectSlugFromTitle } from '@/lib/slug'
import { projectsDb } from '@/lib/database'

// Extended project type to handle both MDX and database content
interface ProjectData {
    title: string
    summary: string
    description: string
    content: string
    technologies: string[]
    date: string
    featured?: boolean
    githubUrl?: string
    demoUrl?: string
    imageUrl?: string
    type: 'mdx' | 'database'
}

async function fetchProject(slug: string): Promise<ProjectData | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects/${slug}`)
        if (response.ok) {
            const data = await response.json()
            return data.success ? data.project : null
        }
    } catch (error) {
        console.error('Error fetching project:', error)
    }
    return null
}

export async function generateStaticParams() {
    // Get both MDX and database projects
    const mdxProjects = getAllProjects()
    const dbProjects = projectsDb.getAll()

    const mdxSlugs = mdxProjects.map((project) => ({ slug: project.slug }))
    const dbSlugs = dbProjects.map((project) => ({ slug: getProjectSlugFromTitle(project.title) }))

    return [...mdxSlugs, ...dbSlugs]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await fetchProject(slug)

    if (!project) {
        return {
            title: 'Project Not Found',
        }
    }

    return {
        title: `${project.title} - Your Name`,
        description: project.summary,
    }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await fetchProject(slug)

    if (!project) {
        notFound()
    }

    return (
        <div className="min-h-screen py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <Link
                    href="/projects"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Projects
                </Link>

                {/* Project Header */}
                <header className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                            {project.title}
                        </h1>
                        {project.featured && (
                            <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                Featured
                            </span>
                        )}
                    </div>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                        {project.summary}
                    </p>

                    {/* Project Meta */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Date:</span> {new Date(project.date).toLocaleDateString()}
                        </div>
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                View on GitHub →
                            </a>
                        )}
                        {project.demoUrl && (
                            <a
                                href={project.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Live Demo →
                            </a>
                        )}
                    </div>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                        {project.technologies?.map((tech: string) => (
                            <span
                                key={tech}
                                className="px-3 py-1 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </header>

                {/* Project Image */}
                {project.imageUrl && (
                    <div className="mb-12">
                        <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Project Content */}
                <article className="prose prose-lg dark:prose-invert max-w-none">
                    {project.type === 'mdx' ? (
                        <MDXContent content={project.content} />
                    ) : (
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: project.description }}
                        />
                    )}
                </article>
            </div>
        </div>
    )
}

