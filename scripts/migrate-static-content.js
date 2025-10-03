const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const crypto = require('crypto')
const Database = require('better-sqlite3')

// Simple UUID v4 generator using crypto
function uuidv4() {
  return crypto.randomUUID()
}

// Initialize database
const DB_PATH = path.join(process.cwd(), 'data', 'portfolio.db')
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

console.log('🚀 Starting migration of static MDX content to database...')

// Function to read and parse MDX files
function parseMDXFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data: frontmatter, content } = matter(fileContent)
  return { frontmatter, content }
}

// Function to migrate blog posts
function migrateBlogPosts() {
  console.log('📝 Migrating blog posts...')

  const blogDir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(blogDir)) {
    console.log('  No blog directory found, skipping...')
    return
  }

  const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.mdx'))

  for (const file of blogFiles) {
    const filePath = path.join(blogDir, file)
    const { frontmatter, content } = parseMDXFile(filePath)

    const slug = file.replace('.mdx', '')
    const blogPost = {
      id: uuidv4(),
      title: frontmatter.title || 'Untitled',
      content: content,
      summary: frontmatter.summary || '',
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      tags: JSON.stringify(frontmatter.tags || []),
      read_time: frontmatter.readTime || '',
      featured: frontmatter.featured || false,
      published: true,
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      publish_date: frontmatter.date || new Date().toISOString().split('T')[0],
      featured_image: frontmatter.image || ''
    }

    // Check if blog post already exists by title (since no slug column)
    const existing = db.prepare('SELECT id FROM blog_posts WHERE title = ?').get(blogPost.title)

    if (existing) {
      console.log(`  ⏭️  Blog post "${blogPost.title}" already exists, skipping...`)
      continue
    }

    // Insert blog post
    const insertStmt = db.prepare(`
      INSERT INTO blog_posts (
        id, title, content, summary, date, tags, read_time, featured, published, created_at, updated_at, publish_date, featured_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    try {
      insertStmt.run(
        blogPost.id,
        blogPost.title,
        blogPost.content,
        blogPost.summary,
        blogPost.date,
        blogPost.tags,
        blogPost.read_time,
        blogPost.featured ? 1 : 0,
        blogPost.published ? 1 : 0,
        blogPost.created_at,
        blogPost.updated_at,
        blogPost.publish_date,
        blogPost.featured_image
      )
      console.log(`  ✅ Migrated blog post: "${blogPost.title}"`)
    } catch (error) {
      console.error(`  ❌ Error migrating blog post "${blogPost.title}":`, error.message)
    }
  }
}

// Function to migrate projects
function migrateProjects() {
  console.log('🚧 Migrating projects...')

  const projectsDir = path.join(process.cwd(), 'content', 'projects')
  if (!fs.existsSync(projectsDir)) {
    console.log('  No projects directory found, skipping...')
    return
  }

  const projectFiles = fs.readdirSync(projectsDir).filter(file => file.endsWith('.mdx'))

  for (const file of projectFiles) {
    const filePath = path.join(projectsDir, file)
    const { frontmatter, content } = parseMDXFile(filePath)

    const project = {
      id: uuidv4(),
      title: frontmatter.title || 'Untitled',
      description: content,
      summary: frontmatter.summary || '',
      technologies: JSON.stringify(frontmatter.technologies || []),
      date: frontmatter.date || new Date().toISOString().split('T')[0],
      featured: frontmatter.featured || false,
      github: frontmatter.github || '',
      demo: frontmatter.demo || '',
      image_url: frontmatter.image || '',
      created_at: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if project already exists by title
    const existing = db.prepare('SELECT id FROM projects WHERE title = ?').get(project.title)

    if (existing) {
      console.log(`  ⏭️  Project "${project.title}" already exists, skipping...`)
      continue
    }

    // Insert project
    const insertStmt = db.prepare(`
      INSERT INTO projects (
        id, title, description, summary, technologies, date, featured, github, demo, image_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    try {
      insertStmt.run(
        project.id,
        project.title,
        project.description,
        project.summary,
        project.technologies,
        project.date,
        project.featured ? 1 : 0,
        project.github,
        project.demo,
        project.image_url,
        project.created_at,
        project.updated_at
      )
      console.log(`  ✅ Migrated project: "${project.title}"`)
    } catch (error) {
      console.error(`  ❌ Error migrating project "${project.title}":`, error.message)
    }
  }
}

// Check database tables exist
function ensureTablesExist() {
  console.log('🔍 Checking database tables...')

  // Check if blog_posts table exists
  const blogTableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='blog_posts'
  `).get()

  if (!blogTableExists) {
    console.log('❌ Blog posts table does not exist!')
    process.exit(1)
  }

  // Check if projects table exists
  const projectsTableExists = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='projects'
  `).get()

  if (!projectsTableExists) {
    console.log('❌ Projects table does not exist!')
    process.exit(1)
  }

  console.log('  ✅ Database tables ready')
}

// Main migration function
function runMigration() {
  try {
    ensureTablesExist()
    migrateBlogPosts()
    migrateProjects()

    console.log('🎉 Migration completed successfully!')

    // Show summary
    const blogCount = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get()
    const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get()

    console.log('')
    console.log('📊 Summary:')
    console.log(`  📝 Blog posts in database: ${blogCount.count}`)
    console.log(`  🚧 Projects in database: ${projectCount.count}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Check if required dependencies exist
try {
  require.resolve('gray-matter')
} catch (error) {
  console.error('❌ Required dependency "gray-matter" not found. Please install it:')
  console.error('npm install gray-matter')
  process.exit(1)
}

// Run migration
runMigration()