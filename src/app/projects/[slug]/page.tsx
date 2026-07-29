import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug } from '@/lib/mdx'
import { MDXContent } from '@/components/MDXContent'
import Link from 'next/link'
import { getProjectSlugFromTitle } from '@/lib/slug'
import { projectsDb } from '@/lib/database-unified'

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
    const mdxProject = getProjectBySlug(slug)
    if (mdxProject) {
        return {
            title: mdxProject.metadata.title,
            summary: mdxProject.metadata.summary,
            description: mdxProject.metadata.summary,
            content: mdxProject.content,
            technologies: mdxProject.metadata.technologies || [],
            date: mdxProject.metadata.date,
            featured: mdxProject.metadata.featured,
            githubUrl: mdxProject.metadata.github,
            demoUrl: mdxProject.metadata.demo,
            imageUrl: mdxProject.metadata.image,
            type: 'mdx',
        }
    }

    try {
        const dbProjects = await projectsDb.getAll()
        const dbProject = dbProjects.find((project) => getProjectSlugFromTitle(project.title) === slug)
        if (dbProject) {
            return {
                title: dbProject.title,
                summary: dbProject.description,
                description: dbProject.description,
                content: dbProject.description,
                technologies: dbProject.techStack,
                date: dbProject.createdAt,
                githubUrl: dbProject.githubLink,
                demoUrl: dbProject.liveDemoLink,
                imageUrl: dbProject.images?.[0],
                type: 'database',
            }
        }
    } catch (error) {
        console.error('Error fetching project from database:', error)
    }

    return null
}

export async function generateStaticParams() {
    // Get both MDX and database projects
    const mdxProjects = getAllProjects()
    let dbProjects: { title: string }[] = []
    
    try {
        dbProjects = await projectsDb.getAll()
    } catch (error) {
        console.error('Database connection failed during build in projects:', error)
    }

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

    // Log project data for debugging
    console.log('Project data:', {
        title: project.title,
        summary: project.summary,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        imageUrl: project.imageUrl,
        technologies: project.technologies
    })

    return (
        <div className="min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto" style={{ width: '85%' }}>
                {/* Back Link */}
                <Link
                    href="/projects"
                    className="inline-flex items-center text-sky-400 hover:text-sky-300 mb-8 transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Projects
                </Link>

                {/* Glass Container with all project details */}
                <div className="glass-morphism rounded-2xl overflow-hidden border border-white/10">
                    {/* Project Image with Title Overlay */}
                    {project.imageUrl && (
                        <div className="relative w-full h-96">
                            <img
                                src={project.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient overlay from top to bottom */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
                            {/* Title at bottom left */}
                            <div className="absolute bottom-0 left-0 p-8 flex items-center gap-4">
                                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                                    {project.title}
                                </h1>
                                {project.featured && (
                                    <span className="px-3 py-1 text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full backdrop-blur-sm">
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content section with padding */}
                    <div className="p-8">
                        {/* Project Meta - URLs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            {project.githubUrl && (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-medium transition-all duration-150"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    GitHub
                                </a>
                            )}
                            {project.demoUrl && (
                                <a
                                    href={project.demoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 rounded-xl text-sky-400 font-medium transition-all duration-150"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Live Demo
                                </a>
                            )}
                        </div>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.technologies?.map((tech: string) => (
                                <span
                                    key={tech}
                                    className="px-3 py-1 text-sm font-medium bg-white/10 text-white/80 rounded-full border border-white/10"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Separator bar */}
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8" />

                        {/* Project Content */}
                        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-white prose-p:text-white/70 prose-strong:text-white prose-code:text-white/90 prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/10">
                            {project.type === 'mdx' ? (
                                <MDXContent content={project.content} />
                            ) : (
                                <div
                                    dangerouslySetInnerHTML={{ __html: project.description }}
                                />
                            )}
                        </article>
                    </div>
                </div>
            </div>
        </div>
    )
}

