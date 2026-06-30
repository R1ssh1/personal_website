// Core data models for the portfolio website

export interface Certification {
  id: string
  title: string
  issuer: string
  issueDate: string
  expirationDate?: string
  verificationLink?: string
  description: string
  tags: string[]
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubLink?: string
  liveDemoLink?: string
  images: string[] // Array of image URLs from Vercel Blob
  createdAt: string
  updatedAt: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string // Rich text content
  tags: string[]
  publishDate: string
  featuredImage?: string // Featured image URL from Vercel Blob
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  username: string
  passwordHash: string
  isAdmin: boolean
  createdAt: string
}

export interface AdminSession {
  id: string
  userId: string
  expiresAt: string
  createdAt: string
}

export interface AboutContent {
  id: string
  content: string // HTML content from WYSIWYG editor
  updatedAt: string
  updatedBy?: string
}

export interface ContactFormSubmission {
  id: string
  name: string
  organisation?: string
  contactInfo: string // email, phone, or social handle
  message: string
  createdAt: string
  read: boolean
}