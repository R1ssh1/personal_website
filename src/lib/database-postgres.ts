import { Pool } from 'pg'
import { Certification, Project, BlogPost, AdminUser, AdminSession } from '@/types'

// PostgreSQL database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Initialize PostgreSQL database tables
export async function initializeDatabasePostgres() {
  const client = await pool.connect()
  
  try {
    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    // Admin sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
      )
    `)

    // Certifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        issuer TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        expiration_date TEXT,
        verification_link TEXT,
        description TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        image_url TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tech_stack TEXT[] NOT NULL DEFAULT '{}',
        github_link TEXT,
        live_demo_link TEXT,
        images TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    // Blog posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT[] NOT NULL DEFAULT '{}',
        publish_date TEXT NOT NULL,
        featured_image TEXT,
        published BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)

    console.log('PostgreSQL database tables initialized successfully')
  } catch (error) {
    console.error('Error initializing PostgreSQL database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Admin Users DB operations for PostgreSQL
export const adminUsersDbPostgres = {
  async getByUsername(username: string): Promise<AdminUser | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM admin_users WHERE username = $1',
        [username]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async getById(id: string): Promise<AdminUser | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM admin_users WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async create(username: string, passwordHash: string, isAdmin: boolean = true): Promise<string> {
    const client = await pool.connect()
    try {
      const id = crypto.randomUUID()
      await client.query(
        'INSERT INTO admin_users (id, username, password_hash, is_admin) VALUES ($1, $2, $3, $4)',
        [id, username, passwordHash, isAdmin]
      )
      return id
    } finally {
      client.release()
    }
  }
}

// Admin Sessions DB operations for PostgreSQL
export const adminSessionsDbPostgres = {
  async create(userId: string, expiresAt: Date): Promise<string> {
    const client = await pool.connect()
    try {
      const id = crypto.randomUUID()
      await client.query(
        'INSERT INTO admin_sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
        [id, userId, expiresAt]
      )
      return id
    } finally {
      client.release()
    }
  },

  async getById(id: string): Promise<AdminSession | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM admin_sessions WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async delete(id: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM admin_sessions WHERE id = $1',
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  },

  async cleanup(): Promise<void> {
    const client = await pool.connect()
    try {
      await client.query(
        'DELETE FROM admin_sessions WHERE expires_at < NOW()'
      )
    } finally {
      client.release()
    }
  }
}

// Certifications DB operations for PostgreSQL
export const certificationsDbPostgres = {
  async getAll(): Promise<Certification[]> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM certifications ORDER BY issue_date DESC'
      )
      return result.rows
    } finally {
      client.release()
    }
  },

  async getById(id: string): Promise<Certification | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM certifications WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async create(certification: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = await pool.connect()
    try {
      const id = crypto.randomUUID()
      await client.query(
        `INSERT INTO certifications 
         (id, title, issuer, issue_date, expiration_date, verification_link, description, tags, image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          certification.title,
          certification.issuer,
          certification.issueDate,
          certification.expirationDate || null,
          certification.verificationLink || null,
          certification.description,
          certification.tags,
          certification.imageUrl
        ]
      )
      return id
    } finally {
      client.release()
    }
  },

  async update(id: string, certification: Partial<Certification>): Promise<boolean> {
    const client = await pool.connect()
    try {
      const fields = []
      const values = []
      let paramIndex = 1

      if (certification.title !== undefined) {
        fields.push(`title = $${paramIndex++}`)
        values.push(certification.title)
      }
      if (certification.issuer !== undefined) {
        fields.push(`issuer = $${paramIndex++}`)
        values.push(certification.issuer)
      }
      if (certification.issueDate !== undefined) {
        fields.push(`issue_date = $${paramIndex++}`)
        values.push(certification.issueDate)
      }
      if (certification.expirationDate !== undefined) {
        fields.push(`expiration_date = $${paramIndex++}`)
        values.push(certification.expirationDate)
      }
      if (certification.verificationLink !== undefined) {
        fields.push(`verification_link = $${paramIndex++}`)
        values.push(certification.verificationLink)
      }
      if (certification.description !== undefined) {
        fields.push(`description = $${paramIndex++}`)
        values.push(certification.description)
      }
      if (certification.tags !== undefined) {
        fields.push(`tags = $${paramIndex++}`)
        values.push(certification.tags)
      }
      if (certification.imageUrl !== undefined) {
        fields.push(`image_url = $${paramIndex++}`)
        values.push(certification.imageUrl)
      }

      if (fields.length === 0) return false

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await client.query(
        `UPDATE certifications SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  },

  async delete(id: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM certifications WHERE id = $1',
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

// Projects DB operations for PostgreSQL  
export const projectsDbPostgres = {
  async getAll(): Promise<Project[]> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM projects ORDER BY created_at DESC'
      )
      return result.rows
    } finally {
      client.release()
    }
  },

  async getById(id: string): Promise<Project | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM projects WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = await pool.connect()
    try {
      const id = crypto.randomUUID()
      await client.query(
        `INSERT INTO projects 
         (id, title, description, tech_stack, github_link, live_demo_link, images) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          id,
          project.title,
          project.description,
          project.techStack,
          project.githubLink || null,
          project.liveDemoLink || null,
          project.images
        ]
      )
      return id
    } finally {
      client.release()
    }
  },

  async update(id: string, project: Partial<Project>): Promise<boolean> {
    const client = await pool.connect()
    try {
      const fields = []
      const values = []
      let paramIndex = 1

      if (project.title !== undefined) {
        fields.push(`title = $${paramIndex++}`)
        values.push(project.title)
      }
      if (project.description !== undefined) {
        fields.push(`description = $${paramIndex++}`)
        values.push(project.description)
      }
      if (project.techStack !== undefined) {
        fields.push(`tech_stack = $${paramIndex++}`)
        values.push(project.techStack)
      }
      if (project.githubLink !== undefined) {
        fields.push(`github_link = $${paramIndex++}`)
        values.push(project.githubLink)
      }
      if (project.liveDemoLink !== undefined) {
        fields.push(`live_demo_link = $${paramIndex++}`)
        values.push(project.liveDemoLink)
      }
      if (project.images !== undefined) {
        fields.push(`images = $${paramIndex++}`)
        values.push(project.images)
      }

      if (fields.length === 0) return false

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await client.query(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  },

  async delete(id: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM projects WHERE id = $1',
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

// Blog Posts DB operations for PostgreSQL
export const blogPostsDbPostgres = {
  async getAll(): Promise<BlogPost[]> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM blog_posts ORDER BY created_at DESC'
      )
      return result.rows
    } finally {
      client.release()
    }
  },

  async getById(id: string): Promise<BlogPost | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM blog_posts WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  },

  async create(blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = await pool.connect()
    try {
      const id = crypto.randomUUID()
      await client.query(
        `INSERT INTO blog_posts 
         (id, title, excerpt, content, tags, publish_date, featured_image, published) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          blogPost.title,
          blogPost.excerpt,
          blogPost.content,
          blogPost.tags,
          blogPost.publishDate,
          blogPost.featuredImage || null,
          blogPost.published || false
        ]
      )
      return id
    } finally {
      client.release()
    }
  },

  async update(id: string, blogPost: Partial<BlogPost>): Promise<boolean> {
    const client = await pool.connect()
    try {
      const fields = []
      const values = []
      let paramIndex = 1

      if (blogPost.title !== undefined) {
        fields.push(`title = $${paramIndex++}`)
        values.push(blogPost.title)
      }
      if (blogPost.excerpt !== undefined) {
        fields.push(`excerpt = $${paramIndex++}`)
        values.push(blogPost.excerpt)
      }
      if (blogPost.content !== undefined) {
        fields.push(`content = $${paramIndex++}`)
        values.push(blogPost.content)
      }
      if (blogPost.tags !== undefined) {
        fields.push(`tags = $${paramIndex++}`)
        values.push(blogPost.tags)
      }
      if (blogPost.publishDate !== undefined) {
        fields.push(`publish_date = $${paramIndex++}`)
        values.push(blogPost.publishDate)
      }
      if (blogPost.featuredImage !== undefined) {
        fields.push(`featured_image = $${paramIndex++}`)
        values.push(blogPost.featuredImage)
      }
      if (blogPost.published !== undefined) {
        fields.push(`published = $${paramIndex++}`)
        values.push(blogPost.published)
      }

      if (fields.length === 0) return false

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await client.query(
        `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  },

  async delete(id: string): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM blog_posts WHERE id = $1',
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

export { pool }