import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDirectory = path.join(process.cwd(), 'content')

export interface ProjectMetadata {
  title: string
  summary: string
  technologies: string[]
  date: string
  slug: string
  featured?: boolean
  github?: string
  demo?: string
  image?: string
}

export interface BlogMetadata {
  title: string
  summary: string
  date: string
  slug: string
  tags: string[]
  readTime?: string
  featured?: boolean
}

export function getAllProjects(): ProjectMetadata[] {
  const projectsDirectory = path.join(contentDirectory, 'projects')
  
  if (!fs.existsSync(projectsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(projectsDirectory)
  const projects = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, '')
      const fullPath = path.join(projectsDirectory, name)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        ...data,
        slug,
      } as ProjectMetadata
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return projects
}

export function getProjectBySlug(slug: string): { metadata: ProjectMetadata; content: string } | null {
  try {
    const fullPath = path.join(contentDirectory, 'projects', `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      metadata: { ...data, slug } as ProjectMetadata,
      content,
    }
  } catch (error) {
    return null
  }
}

export function getAllBlogPosts(): BlogMetadata[] {
  const blogDirectory = path.join(contentDirectory, 'blog')
  
  if (!fs.existsSync(blogDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(blogDirectory)
  const posts = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, '')
      const fullPath = path.join(blogDirectory, name)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)
      
      return {
        ...data,
        slug,
      } as BlogMetadata
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return posts
}

export function getBlogPostBySlug(slug: string): { metadata: BlogMetadata; content: string } | null {
  try {
    const fullPath = path.join(contentDirectory, 'blog', `${slug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    return {
      metadata: { ...data, slug } as BlogMetadata,
      content,
    }
  } catch (error) {
    return null
  }
}

export function getAboutContent(): { content: string } | null {
  try {
    const fullPath = path.join(contentDirectory, 'about.mdx')
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { content } = matter(fileContents)
    
    return { content }
  } catch (error) {
    return null
  }
}

export function getUsesContent(): { content: string } | null {
  try {
    const fullPath = path.join(contentDirectory, 'uses.mdx')
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { content } = matter(fileContents)
    
    return { content }
  } catch (error) {
    return null
  }
}
