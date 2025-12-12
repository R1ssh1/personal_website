import Database from 'better-sqlite3'
import path from 'path'
import { Certification, Project, BlogPost, AdminUser, AdminSession, AboutContent, ContactFormSubmission } from '@/types'

const dbPath = path.join(process.cwd(), 'data', 'portfolio.db')

// Ensure data directory exists
import fs from 'fs'
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(dbPath)

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL')

// Initialize database tables
export function initializeDatabase() {
  // Admin users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `)

  // Admin sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users (id)
    )
  `)

  // Certifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      expiration_date TEXT,
      verification_link TEXT,
      description TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array as string
      image_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL, -- JSON array as string
      github_link TEXT,
      live_demo_link TEXT,
      images TEXT NOT NULL, -- JSON array as string
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Blog posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL, -- JSON array as string
      publish_date TEXT NOT NULL,
      featured_image TEXT,
      published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // About content table (single row for about page)
  db.exec(`
    CREATE TABLE IF NOT EXISTS about_content (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT
    )
  `)

  // Contact form submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      organisation TEXT,
      contact_info TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0
    )
  `)

  // High scores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS high_scores (
      id TEXT PRIMARY KEY,
      game_name TEXT NOT NULL,
      username TEXT NOT NULL,
      score INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(game_name)
    )
  `)

  // Add migration for existing tables that might not have all columns
  migrateTables()
}

// Database migration function
function migrateTables() {
  try {
    // Check if blog_posts table exists and has all required columns
    const blogColumns = db.prepare("PRAGMA table_info(blog_posts)").all() as any[]
    const blogColumnNames = blogColumns.map(col => col.name)

    if (blogColumns.length > 0) {
      // Table exists, check for missing columns
      if (!blogColumnNames.includes('publish_date')) {
        db.exec(`ALTER TABLE blog_posts ADD COLUMN publish_date TEXT DEFAULT '${new Date().toISOString()}'`)
      }
      if (!blogColumnNames.includes('featured_image')) {
        db.exec(`ALTER TABLE blog_posts ADD COLUMN featured_image TEXT`)
      }
      if (!blogColumnNames.includes('published')) {
        db.exec(`ALTER TABLE blog_posts ADD COLUMN published INTEGER NOT NULL DEFAULT 0`)
      }
    }

    // Check if projects table needs images column
    const projectColumns = db.prepare("PRAGMA table_info(projects)").all() as any[]
    const projectColumnNames = projectColumns.map(col => col.name)

    if (projectColumns.length > 0 && !projectColumnNames.includes('images')) {
      // Add images column to store array of image URLs as JSON
      db.exec(`ALTER TABLE projects ADD COLUMN images TEXT DEFAULT '[]'`)
      console.log('✅ Added images column to projects table')
    }
  } catch (error) {
    console.log('Migration info:', error)
  }
}

// Database operations for certifications
export const certificationsDb = {
  getAll: (): Certification[] => {
    const stmt = db.prepare('SELECT * FROM certifications ORDER BY issue_date DESC')
    const rows = stmt.all() as any[]
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      issuer: row.issuer,
      issueDate: row.issue_date,
      expirationDate: row.expiration_date,
      verificationLink: row.verification_link,
      description: row.description,
      tags: JSON.parse(row.tags),
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  getById: (id: string): Certification | null => {
    const stmt = db.prepare('SELECT * FROM certifications WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      title: row.title,
      issuer: row.issuer,
      issueDate: row.issue_date,
      expirationDate: row.expiration_date,
      verificationLink: row.verification_link,
      description: row.description,
      tags: JSON.parse(row.tags),
      imageUrl: row.image_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  create: (certification: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO certifications 
      (id, title, issuer, issue_date, expiration_date, verification_link, description, tags, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      certification.title,
      certification.issuer,
      certification.issueDate,
      certification.expirationDate,
      certification.verificationLink,
      certification.description,
      JSON.stringify(certification.tags),
      certification.imageUrl,
      now,
      now
    )

    return id
  },

  update: (id: string, certification: Partial<Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>>): boolean => {
    const now = new Date().toISOString()
    const fields = []
    const values = []

    if (certification.title !== undefined) {
      fields.push('title = ?')
      values.push(certification.title)
    }
    if (certification.issuer !== undefined) {
      fields.push('issuer = ?')
      values.push(certification.issuer)
    }
    if (certification.issueDate !== undefined) {
      fields.push('issue_date = ?')
      values.push(certification.issueDate)
    }
    if (certification.expirationDate !== undefined) {
      fields.push('expiration_date = ?')
      values.push(certification.expirationDate)
    }
    if (certification.verificationLink !== undefined) {
      fields.push('verification_link = ?')
      values.push(certification.verificationLink)
    }
    if (certification.description !== undefined) {
      fields.push('description = ?')
      values.push(certification.description)
    }
    if (certification.tags !== undefined) {
      fields.push('tags = ?')
      values.push(JSON.stringify(certification.tags))
    }
    if (certification.imageUrl !== undefined) {
      fields.push('image_url = ?')
      values.push(certification.imageUrl)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = db.prepare(`UPDATE certifications SET ${fields.join(', ')} WHERE id = ?`)
    const result = stmt.run(...values)
    return result.changes > 0
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM certifications WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  deleteAll: (): boolean => {
    const stmt = db.prepare('DELETE FROM certifications')
    const result = stmt.run()
    return result.changes > 0
  }
}

// Database operations for admin users
export const adminUsersDb = {
  getByUsername: (username: string): AdminUser | null => {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE username = ?')
    const row = stmt.get(username) as any
    if (!row) return null

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      isAdmin: Boolean(row.is_admin),
      createdAt: row.created_at
    }
  },

  getById: (id: string): AdminUser | null => {
    const stmt = db.prepare('SELECT * FROM admin_users WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      isAdmin: Boolean(row.is_admin),
      createdAt: row.created_at
    }
  },

  create: (username: string, passwordHash: string, isAdmin: boolean = true): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, is_admin, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(id, username, passwordHash, isAdmin ? 1 : 0, now)
    return id
  }
}

// Database operations for admin sessions
export const adminSessionsDb = {
  create: (userId: string, expiresAt: string): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO admin_sessions (id, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `)

    stmt.run(id, userId, expiresAt, now)
    return id
  },

  getById: (id: string): AdminSession | null => {
    const stmt = db.prepare('SELECT * FROM admin_sessions WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    }
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM admin_sessions WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  deleteExpired: (): number => {
    const now = new Date().toISOString()
    const stmt = db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?')
    const result = stmt.run(now)
    return result.changes
  }
}

// Database operations for projects
export const projectsDb = {
  getAll: (): Project[] => {
    const stmt = db.prepare('SELECT * FROM projects ORDER BY created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      techStack: row.technologies ? JSON.parse(row.technologies) : [],
      githubLink: row.github || '',
      liveDemoLink: row.demo || '',
      images: row.images ? JSON.parse(row.images) : (row.image_url ? [row.image_url] : []),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  getById: (id: string): Project | null => {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      techStack: row.technologies ? JSON.parse(row.technologies) : [],
      githubLink: row.github || '',
      liveDemoLink: row.demo || '',
      images: row.images ? JSON.parse(row.images) : (row.image_url ? [row.image_url] : []),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  create: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO projects 
      (id, title, description, technologies, github, demo, image_url, images, summary, date, featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const imagesArray = project.images || []
    stmt.run(
      id,
      project.title,
      project.description,
      JSON.stringify(project.techStack || []),
      project.githubLink || '',
      project.liveDemoLink || '',
      imagesArray[0] || '', // Use first image as main image for backward compatibility
      JSON.stringify(imagesArray), // Store full images array
      '', // summary - empty for now
      now.split('T')[0], // date as YYYY-MM-DD
      0, // featured - default false
      now,
      now
    )

    return id
  },

  update: (id: string, project: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): boolean => {
    const now = new Date().toISOString()
    const fields = []
    const values = []

    if (project.title !== undefined) {
      fields.push('title = ?')
      values.push(project.title)
    }
    if (project.description !== undefined) {
      fields.push('description = ?')
      values.push(project.description)
    }
    if (project.techStack !== undefined) {
      fields.push('technologies = ?')
      values.push(JSON.stringify(project.techStack))
    }
    if (project.githubLink !== undefined) {
      fields.push('github = ?')
      values.push(project.githubLink)
    }
    if (project.liveDemoLink !== undefined) {
      fields.push('demo = ?')
      values.push(project.liveDemoLink)
    }
    if (project.images !== undefined) {
      fields.push('image_url = ?')
      values.push(project.images?.[0] || '') // Use first image for backward compatibility
      fields.push('images = ?')
      values.push(JSON.stringify(project.images || [])) // Store full images array
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
    const result = stmt.run(...values)
    return result.changes > 0
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

// Database operations for blog posts
export const blogPostsDb = {
  getAll: (): BlogPost[] => {
    const stmt = db.prepare('SELECT * FROM blog_posts ORDER BY publish_date DESC, date DESC, created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      excerpt: row.summary || row.excerpt || '',
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      publishDate: row.publish_date || row.date || row.created_at,
      featuredImage: row.featured_image,
      published: Boolean(row.published),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  getPublished: (): BlogPost[] => {
    const stmt = db.prepare('SELECT * FROM blog_posts WHERE published = 1 ORDER BY publish_date DESC, date DESC, created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      excerpt: row.summary || row.excerpt || '',
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      publishDate: row.publish_date || row.date || row.created_at,
      featuredImage: row.featured_image,
      published: Boolean(row.published),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))
  },

  getById: (id: string): BlogPost | null => {
    const stmt = db.prepare('SELECT * FROM blog_posts WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      title: row.title,
      excerpt: row.summary || row.excerpt || '',
      content: row.content,
      tags: JSON.parse(row.tags || '[]'),
      publishDate: row.publish_date || row.date || row.created_at,
      featuredImage: row.featured_image,
      published: Boolean(row.published),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  },

  create: (blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO blog_posts 
      (id, title, summary, content, date, tags, publish_date, featured_image, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      blogPost.title,
      blogPost.excerpt || '', // Map excerpt to summary
      blogPost.content,
      blogPost.publishDate || now.split('T')[0], // Add date column
      JSON.stringify(blogPost.tags || []),
      blogPost.publishDate || now.split('T')[0],
      blogPost.featuredImage || '',
      blogPost.published ? 1 : 0,
      now,
      now
    )

    return id
  },

  update: (id: string, blogPost: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>>): boolean => {
    const now = new Date().toISOString()
    const fields = []
    const values = []

    if (blogPost.title !== undefined) {
      fields.push('title = ?')
      values.push(blogPost.title)
    }
    if (blogPost.excerpt !== undefined) {
      fields.push('summary = ?')
      values.push(blogPost.excerpt)
    }
    if (blogPost.content !== undefined) {
      fields.push('content = ?')
      values.push(blogPost.content)
    }
    if (blogPost.tags !== undefined) {
      fields.push('tags = ?')
      values.push(JSON.stringify(blogPost.tags))
    }
    if (blogPost.publishDate !== undefined) {
      fields.push('publish_date = ?')
      values.push(blogPost.publishDate)
      fields.push('date = ?') // Also update date column
      values.push(blogPost.publishDate)
    }
    if (blogPost.featuredImage !== undefined) {
      fields.push('featured_image = ?')
      values.push(blogPost.featuredImage)
    }
    if (blogPost.published !== undefined) {
      fields.push('published = ?')
      values.push(blogPost.published ? 1 : 0)
    }

    fields.push('updated_at = ?')
    values.push(now)
    values.push(id)

    const stmt = db.prepare(`UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`)
    const result = stmt.run(...values)
    return result.changes > 0
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM blog_posts WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

// Database operations for about content
export const aboutContentDb = {
  get: (): AboutContent | null => {
    const stmt = db.prepare('SELECT * FROM about_content LIMIT 1')
    const row = stmt.get() as any
    if (!row) return null

    return {
      id: row.id,
      content: row.content,
      updatedAt: row.updated_at,
      updatedBy: row.updated_by
    }
  },

  upsert: (content: string, updatedBy?: string): string => {
    const now = new Date().toISOString()
    const existing = aboutContentDb.get()

    if (existing) {
      const stmt = db.prepare(`
        UPDATE about_content SET content = ?, updated_at = ?, updated_by = ? WHERE id = ?
      `)
      stmt.run(content, now, updatedBy || null, existing.id)
      return existing.id
    } else {
      const id = crypto.randomUUID()
      const stmt = db.prepare(`
        INSERT INTO about_content (id, content, updated_at, updated_by)
        VALUES (?, ?, ?, ?)
      `)
      stmt.run(id, content, now, updatedBy || null)
      return id
    }
  }
}

// Database operations for contact form submissions
export const contactSubmissionsDb = {
  getAll: (): ContactFormSubmission[] => {
    const stmt = db.prepare('SELECT * FROM contact_submissions ORDER BY created_at DESC')
    const rows = stmt.all() as any[]
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      organisation: row.organisation,
      contactInfo: row.contact_info,
      message: row.message,
      createdAt: row.created_at,
      read: Boolean(row.read)
    }))
  },

  getById: (id: string): ContactFormSubmission | null => {
    const stmt = db.prepare('SELECT * FROM contact_submissions WHERE id = ?')
    const row = stmt.get(id) as any
    if (!row) return null

    return {
      id: row.id,
      name: row.name,
      organisation: row.organisation,
      contactInfo: row.contact_info,
      message: row.message,
      createdAt: row.created_at,
      read: Boolean(row.read)
    }
  },

  create: (submission: Omit<ContactFormSubmission, 'id' | 'createdAt' | 'read'>): string => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    const stmt = db.prepare(`
      INSERT INTO contact_submissions (id, name, organisation, contact_info, message, created_at, read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      submission.name,
      submission.organisation || null,
      submission.contactInfo,
      submission.message,
      now,
      0
    )

    return id
  },

  markAsRead: (id: string): boolean => {
    const stmt = db.prepare('UPDATE contact_submissions SET read = 1 WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM contact_submissions WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}

// Database operations for high scores
export const highScoresDb = {
  getByGame: (gameName: string): { id: string; gameName: string; username: string; score: number; createdAt: string } | null => {
    const stmt = db.prepare('SELECT * FROM high_scores WHERE game_name = ?')
    const row = stmt.get(gameName) as any
    if (!row) return null

    return {
      id: row.id,
      gameName: row.game_name,
      username: row.username,
      score: row.score,
      createdAt: row.created_at
    }
  },

  createOrUpdate: (gameName: string, username: string, score: number): string => {
    const existing = highScoresDb.getByGame(gameName)
    const now = new Date().toISOString()

    if (existing) {
      // Only update if new score is higher
      if (score > existing.score) {
        const stmt = db.prepare(`
          UPDATE high_scores 
          SET username = ?, score = ?, created_at = ?
          WHERE game_name = ?
        `)
        stmt.run(username, score, now, gameName)
        return existing.id
      }
      return existing.id
    } else {
      // Create new high score
      const id = crypto.randomUUID()
      const stmt = db.prepare(`
        INSERT INTO high_scores (id, game_name, username, score, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      stmt.run(id, gameName, username, score, now)
      return id
    }
  }
}

// Initialize database on import
initializeDatabase()

export default db