// Unified database interface that works with both SQLite (development) and PostgreSQL (production)
import { Certification, Project, BlogPost, AdminUser, AdminSession, AboutContent, ContactFormSubmission } from '@/types'

// Import the existing SQLite database
import {
  adminUsersDb as sqliteAdminUsersDb,
  adminSessionsDb as sqliteAdminSessionsDb,
  certificationsDb as sqliteCertificationsDb,
  projectsDb as sqliteProjectsDb,
  blogPostsDb as sqliteBlogPostsDb,
  aboutContentDb as sqliteAboutContentDb,
  contactSubmissionsDb as sqliteContactSubmissionsDb,
  highScoresDb as sqliteHighScoresDb,
  initializeDatabase as initializeSQLite
} from './database'

// Import the PostgreSQL database
import {
  adminUsersDbPostgres,
  adminSessionsDbPostgres,
  certificationsDbPostgres,
  projectsDbPostgres,
  blogPostsDbPostgres,
  aboutContentDbPostgres,
  contactSubmissionsDbPostgres,
  initializeDatabasePostgres
} from './database-postgres'

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production'

// Async wrappers for SQLite to maintain consistency
const sqliteAdminUsersDbAsync = {
  async getByUsername(username: string): Promise<AdminUser | null> {
    return sqliteAdminUsersDb.getByUsername(username)
  },
  async getById(id: string): Promise<AdminUser | null> {
    return sqliteAdminUsersDb.getById(id)
  },
  async create(username: string, passwordHash: string, isAdmin: boolean = true): Promise<string> {
    return sqliteAdminUsersDb.create(username, passwordHash, isAdmin)
  }
}

const sqliteAdminSessionsDbAsync = {
  async create(userId: string, expiresAt: Date): Promise<string> {
    return sqliteAdminSessionsDb.create(userId, expiresAt.toISOString())
  },
  async getById(id: string): Promise<AdminSession | null> {
    return sqliteAdminSessionsDb.getById(id)
  },
  async delete(id: string): Promise<boolean> {
    return sqliteAdminSessionsDb.delete(id)
  },
  async cleanup(): Promise<void> {
    sqliteAdminSessionsDb.deleteExpired()
    return
  }
}

const sqliteCertificationsDbAsync = {
  async getAll(): Promise<Certification[]> {
    return sqliteCertificationsDb.getAll()
  },
  async getById(id: string): Promise<Certification | null> {
    return sqliteCertificationsDb.getById(id)
  },
  async create(certification: Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return sqliteCertificationsDb.create(certification)
  },
  async update(id: string, certification: Partial<Certification>): Promise<boolean> {
    return sqliteCertificationsDb.update(id, certification)
  },
  async delete(id: string): Promise<boolean> {
    return sqliteCertificationsDb.delete(id)
  }
}

const sqliteProjectsDbAsync = {
  async getAll(): Promise<Project[]> {
    return sqliteProjectsDb.getAll()
  },
  async getById(id: string): Promise<Project | null> {
    return sqliteProjectsDb.getById(id)
  },
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return sqliteProjectsDb.create(project)
  },
  async update(id: string, project: Partial<Project>): Promise<boolean> {
    return sqliteProjectsDb.update(id, project)
  },
  async delete(id: string): Promise<boolean> {
    return sqliteProjectsDb.delete(id)
  }
}

const sqliteBlogPostsDbAsync = {
  async getAll(): Promise<BlogPost[]> {
    return sqliteBlogPostsDb.getAll()
  },
  async getById(id: string): Promise<BlogPost | null> {
    return sqliteBlogPostsDb.getById(id)
  },
  async create(blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return sqliteBlogPostsDb.create(blogPost)
  },
  async update(id: string, blogPost: Partial<BlogPost>): Promise<boolean> {
    return sqliteBlogPostsDb.update(id, blogPost)
  },
  async delete(id: string): Promise<boolean> {
    return sqliteBlogPostsDb.delete(id)
  }
}

const sqliteAboutContentDbAsync = {
  async get(): Promise<AboutContent | null> {
    return sqliteAboutContentDb.get()
  },
  async upsert(content: string, updatedBy?: string): Promise<string> {
    return sqliteAboutContentDb.upsert(content, updatedBy)
  }
}

const sqliteContactSubmissionsDbAsync = {
  async getAll(): Promise<ContactFormSubmission[]> {
    return sqliteContactSubmissionsDb.getAll()
  },
  async getById(id: string): Promise<ContactFormSubmission | null> {
    return sqliteContactSubmissionsDb.getById(id)
  },
  async create(submission: Omit<ContactFormSubmission, 'id' | 'createdAt' | 'read'>): Promise<string> {
    return sqliteContactSubmissionsDb.create(submission)
  },
  async markAsRead(id: string): Promise<boolean> {
    return sqliteContactSubmissionsDb.markAsRead(id)
  },
  async delete(id: string): Promise<boolean> {
    return sqliteContactSubmissionsDb.delete(id)
  }
}

const sqliteHighScoresDbAsync = {
  async getByGame(gameName: string): Promise<{ id: string; gameName: string; username: string; score: number; createdAt: string } | null> {
    return sqliteHighScoresDb.getByGame(gameName)
  },
  async createOrUpdate(gameName: string, username: string, score: number): Promise<string> {
    return sqliteHighScoresDb.createOrUpdate(gameName, username, score)
  }
}

// Export the appropriate database functions
export const initializeDatabase = usePostgres ? initializeDatabasePostgres : async () => initializeSQLite()

export const adminUsersDb = usePostgres ? adminUsersDbPostgres : sqliteAdminUsersDbAsync
export const adminSessionsDb = usePostgres ? adminSessionsDbPostgres : sqliteAdminSessionsDbAsync
export const certificationsDb = usePostgres ? certificationsDbPostgres : sqliteCertificationsDbAsync
export const projectsDb = usePostgres ? projectsDbPostgres : sqliteProjectsDbAsync
export const blogPostsDb = usePostgres ? blogPostsDbPostgres : sqliteBlogPostsDbAsync
export const aboutContentDb = usePostgres ? aboutContentDbPostgres : sqliteAboutContentDbAsync
export const contactSubmissionsDb = usePostgres ? contactSubmissionsDbPostgres : sqliteContactSubmissionsDbAsync
export const highScoresDb = sqliteHighScoresDbAsync // For now, only SQLite support

// Initialize the database on import for SQLite only (development)
if (usePostgres) {
  console.log('Using PostgreSQL database in production. Ensure tables are initialized via setup script.')
} else {
  console.log('Using SQLite database in development')
  initializeSQLite()
}