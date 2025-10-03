// Hybrid database configuration that uses PostgreSQL in production and SQLite in development
import { Certification, Project, BlogPost, AdminUser, AdminSession } from '@/types'

// Import the existing SQLite database
import { 
  adminUsersDb as sqliteAdminUsersDb,
  adminSessionsDb as sqliteAdminSessionsDb,
  certificationsDb as sqliteCertificationsDb,
  projectsDb as sqliteProjectsDb,
  blogPostsDb as sqliteBlogPostsDb,
  initializeDatabase as initializeSQLite
} from './database'

// Import the PostgreSQL database
import {
  adminUsersDbPostgres,
  adminSessionsDbPostgres,
  certificationsDbPostgres,
  projectsDbPostgres,
  blogPostsDbPostgres,
  initializeDatabasePostgres
} from './database-postgres'

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL && process.env.NODE_ENV === 'production'

// Export the appropriate database functions
export const initializeDatabase = usePostgres ? initializeDatabasePostgres : initializeSQLite

export const adminUsersDb = usePostgres ? adminUsersDbPostgres : sqliteAdminUsersDb
export const adminSessionsDb = usePostgres ? adminSessionsDbPostgres : sqliteAdminSessionsDb
export const certificationsDb = usePostgres ? certificationsDbPostgres : sqliteCertificationsDb
export const projectsDb = usePostgres ? projectsDbPostgres : sqliteProjectsDb
export const blogPostsDb = usePostgres ? blogPostsDbPostgres : sqliteBlogPostsDb

// Initialize the database on import
if (usePostgres) {
  console.log('Using PostgreSQL database in production')
  initializeDatabasePostgres().catch(console.error)
} else {
  console.log('Using SQLite database in development')
  initializeSQLite()
}