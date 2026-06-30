'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BlogPost, Project, Certification } from '@/types'
import UnifiedContentForm from '@/components/UnifiedContentForm'
import RichTextEditor from '@/components/RichTextEditor'
import { useAuth } from '@/hooks/useAuth'

interface Tab {
  id: string
  label: string
}

const tabs: Tab[] = [
  { id: 'certifications', label: 'Certifications' },
  { id: 'blogs', label: 'Blog Posts' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact Messages' }
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('certifications')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Add authentication protection
  const { authenticated, isAdmin, loading: authLoading, logout } = useAuth(true)

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, the useAuth hook will redirect to /admin
  // But we can add an extra check here as a fallback
  if (!authenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Access denied. Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            Admin Dashboard
          </motion.h1>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-white hover:bg-red-500/30 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
        >
          {activeTab === 'certifications' && <CertificationsManager />}
          {activeTab === 'blogs' && <BlogsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'about' && <AboutManager />}
          {activeTab === 'contact' && <ContactMessagesManager />}
        </motion.div>
      </div>
    </div>
  )
}

// Certification Manager Component
function CertificationsManager() {
  const [certifications, setCertifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCertification, setEditingCertification] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCertifications()
  }, [])

  const fetchCertifications = async () => {
    try {
      const response = await fetch('/api/admin/certifications', {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Failed to fetch certifications')
      }
      const data = await response.json()
      setCertifications(data)
    } catch (error) {
      console.error('Failed to fetch certifications:', error)
      setCertifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCertification = async (certificationData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/certifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(certificationData),
      })

      if (response.ok) {
        await fetchCertifications()
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create certification')
      }
    } catch (error) {
      console.error('Create certification error:', error)
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateCertification = async (certificationData: any) => {
    if (!editingCertification) return

    setIsSubmitting(true)
    try {
      // Placeholder for certification update
      console.log('Updating certification:', certificationData)
      // Once API is implemented, replace with actual API call
      setEditingCertification(null)
    } catch (error) {
      console.error('Update certification error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCertification = async (certificationId: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return

    try {
      const response = await fetch(`/api/admin/certifications/${certificationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete certification')
      }

      // Refresh the certifications list
      fetchCertifications()
    } catch (error) {
      console.error('Delete certification error:', error)
      alert('Failed to delete certification. Please try again.')
    }
  }

  if (showCreateForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Certification</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="certification"
          onSubmit={handleCreateCertification}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  if (editingCertification) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Certification</h2>
          <button
            onClick={() => setEditingCertification(null)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="certification"
          initialData={editingCertification}
          onSubmit={handleUpdateCertification}
          onCancel={() => setEditingCertification(null)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Certifications</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors"
        >
          Add Certification
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading certifications...</p>
          </div>
        ) : certifications.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-white/70 mb-4">No certifications found</p>
            <p className="text-white/50 mb-6 text-sm">Add your professional certifications to showcase your expertise</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors"
            >
              Add Your First Certification
            </button>
          </div>
        ) : (
          certifications.map((certification, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {certification.badgeUrl && (
                      <img
                        src={certification.badgeUrl}
                        alt={`${certification.title} badge`}
                        className="w-12 h-12 object-contain"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{certification.title}</h3>
                      <p className="text-purple-400">{certification.issuer}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-white/70 mb-3">
                    <span>📅 Issued: {new Date(certification.dateIssued).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    {certification.certificateUrl && (
                      <a
                        href={certification.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        📜 View Certificate
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingCertification(certification)}
                    className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCertification(certification.id)}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-white hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// Blog Manager Component
function BlogsManager() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blogs', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs || [])
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBlog = async (blogData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(blogData),
      })

      if (response.ok) {
        await fetchBlogs()
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create blog')
      }
    } catch (error) {
      console.error('Create blog error:', error)
      // You could add a toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateBlog = async (blogData: any) => {
    if (!editingBlog) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      })

      if (response.ok) {
        await fetchBlogs()
        setEditingBlog(null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update blog')
      }
    } catch (error) {
      console.error('Update blog error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBlogs()
      } else {
        throw new Error('Failed to delete blog')
      }
    } catch (error) {
      console.error('Delete blog error:', error)
    }
  }

  if (showCreateForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Blog Post</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="blog"
          onSubmit={handleCreateBlog}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  if (editingBlog) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Blog Post</h2>
          <button
            onClick={() => setEditingBlog(null)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="blog"
          initialData={editingBlog}
          onSubmit={handleUpdateBlog}
          onCancel={() => setEditingBlog(null)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Blog Posts</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-white hover:bg-green-500/30 transition-colors"
        >
          Create Post
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <p className="text-white/70 mb-4">No blog posts found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-white hover:bg-green-500/30 transition-colors"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          blogs.map((blog) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{blog.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.published
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-white/70 mb-3 line-clamp-2">{blog.excerpt}</p>

                  <div className="flex items-center space-x-4 text-sm text-white/50">
                    <span>📅 {new Date(blog.publishDate).toLocaleDateString()}</span>
                    {blog.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>🏷️</span>
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-white/40 text-xs">+{blog.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingBlog(blog)}
                    className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-white hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// Project Manager Component
function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (projectData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        await fetchProjects()
        setShowCreateForm(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Create project error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        await fetchProjects()
        setEditingProject(null)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Update project error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProjects()
      } else {
        throw new Error('Failed to delete project')
      }
    } catch (error) {
      console.error('Delete project error:', error)
    }
  }

  if (showCreateForm) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Project</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="project"
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateForm(false)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  if (editingProject) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Project</h2>
          <button
            onClick={() => setEditingProject(null)}
            className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-lg text-white hover:bg-gray-500/30 transition-colors"
          >
            Cancel
          </button>
        </div>

        <UnifiedContentForm
          contentType="project"
          initialData={editingProject}
          onSubmit={handleUpdateProject}
          onCancel={() => setEditingProject(null)}
          isSubmitting={isSubmitting}
          className="bg-white/5 rounded-xl p-6"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Projects</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-white hover:bg-purple-500/30 transition-colors"
        >
          Add Project
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/70">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white/5 rounded-xl p-8 text-center">
            <p className="text-white/70 mb-4">No projects found</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-white hover:bg-purple-500/30 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>

                  <div
                    className="text-white/70 mb-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: project.description.substring(0, 200) + '...' }}
                  />

                  <div className="flex items-center space-x-4 text-sm text-white/50 mb-3">
                    {project.techStack.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span>🔧</span>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 4).map((tech, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                          {project.techStack.length > 4 && (
                            <span className="text-white/40 text-xs">+{project.techStack.length - 4} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        🔗 GitHub
                      </a>
                    )}
                    {project.liveDemoLink && (
                      <a
                        href={project.liveDemoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        🚀 Live Demo
                      </a>
                    )}
                    {project.images.length > 0 && (
                      <span className="text-white/50">🖼️ {project.images.length} image{project.images.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingProject(project)}
                    className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-white hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-white hover:bg-red-500/30 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

// About Page Manager Component
function AboutManager() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    fetchAboutContent()
  }, [])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/admin/about', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || '')
      }
    } catch (error) {
      console.error('Failed to fetch about content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setLastSaved(new Date())
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Save about content error:', error)
      alert('Failed to save about content. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Loading about content...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit About Page</h2>
          {lastSaved && (
            <p className="text-sm text-white/50 mt-1">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-white hover:bg-green-500/30 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write your about page content here..."
          height={500}
        />
      </div>

      <p className="text-white/50 text-sm mt-4">
        Use the rich text editor above to format your About page content.
        Changes will be reflected on the public About page after saving.
      </p>
    </div>
  )
}

// Contact Messages Manager Component
function ContactMessagesManager() {
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/admin/contact', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setMessages(data.submissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/contact/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m))
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/admin/contact/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (response.ok) {
        setMessages(messages.filter(m => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Loading messages...</p>
      </div>
    )
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Messages</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-blue-400 mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white/5 rounded-xl p-8 text-center">
          <p className="text-white/70">No contact messages yet.</p>
          <p className="text-white/50 text-sm mt-2">Messages from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Message List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.read) handleMarkAsRead(message.id)
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMessage?.id === message.id
                  ? 'bg-white/10 border-blue-500/50'
                  : message.read
                    ? 'bg-white/5 border-white/10 hover:bg-white/10'
                    : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-white">{message.name}</h4>
                    {message.organisation && (
                      <p className="text-sm text-white/50">{message.organisation}</p>
                    )}
                  </div>
                  {!message.read && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                      New
                    </span>
                  )}
                </div>
                <p className="text-white/70 text-sm line-clamp-2">{message.message}</p>
                <p className="text-white/40 text-xs mt-2">
                  {new Date(message.createdAt).toLocaleDateString()} at{' '}
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Message Detail */}
          {selectedMessage ? (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedMessage.name}</h3>
                  {selectedMessage.organisation && (
                    <p className="text-white/50">{selectedMessage.organisation}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-white/50 mb-1">Contact Info:</p>
                <p className="text-white">{selectedMessage.contactInfo}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-white/50 mb-1">Message:</p>
                <p className="text-white whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-white/40 text-sm">
                  Received: {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex items-center justify-center">
              <p className="text-white/50">Select a message to view details</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}