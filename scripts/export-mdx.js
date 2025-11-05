/**
 * Export Database Content to MDX Files
 * 
 * This script exports all blog posts and projects from the database
 * to MDX files in the content/ directory. Useful for:
 * - Backing up admin-created content
 * - Migrating from database to static MDX
 * - Creating snapshots before major changes
 * 
 * Usage: node scripts/export-mdx.js
 */

const { blogPostsDb, projectsDb } = require('../src/lib/database-unified')
const fs = require('fs')
const path = require('path')

// Ensure content directories exist
const blogDir = path.join(__dirname, '../content/blog')
const projectsDir = path.join(__dirname, '../content/projects')

if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true })
}
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true })
}

/**
 * Convert title to valid filename slug
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single
    .trim()
}

/**
 * Export blog posts to MDX files
 */
async function exportBlogPosts() {
  console.log('📝 Exporting blog posts...')
  
  const posts = await blogPostsDb.getAll()
  
  if (posts.length === 0) {
    console.log('  ℹ️  No blog posts found in database')
    return
  }

  let exported = 0
  let skipped = 0

  posts.forEach(post => {
    const slug = slugify(post.title)
    const filename = `${slug}.mdx`
    const filepath = path.join(blogDir, filename)

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`  ⚠️  Skipping "${post.title}" - file already exists`)
      skipped++
      return
    }

    const frontmatter = `---
title: "${post.title}"
summary: "${post.excerpt}"
date: "${post.publishDate}"
tags: ${JSON.stringify(post.tags)}
featured: ${post.published || false}
${post.featuredImage ? `image: "${post.featuredImage}"` : ''}
---

${post.content}
`

    fs.writeFileSync(filepath, frontmatter, 'utf8')
    console.log(`  ✅ Exported: ${filename}`)
    exported++
  })

  console.log(`\n📊 Blog Posts: ${exported} exported, ${skipped} skipped`)
}

/**
 * Export projects to MDX files
 */
async function exportProjects() {
  console.log('\n🚀 Exporting projects...')
  
  const projects = await projectsDb.getAll()
  
  if (projects.length === 0) {
    console.log('  ℹ️  No projects found in database')
    return
  }

  let exported = 0
  let skipped = 0

  projects.forEach(project => {
    const slug = slugify(project.title)
    const filename = `${slug}.mdx`
    const filepath = path.join(projectsDir, filename)

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`  ⚠️  Skipping "${project.title}" - file already exists`)
      skipped++
      return
    }

    const frontmatter = `---
title: "${project.title}"
summary: "${project.description}"
date: "${project.createdAt}"
technologies: ${JSON.stringify(project.techStack)}
${project.githubLink ? `github: "${project.githubLink}"` : ''}
${project.liveDemoLink ? `demo: "${project.liveDemoLink}"` : ''}
${project.images && project.images.length > 0 ? `image: "${project.images[0]}"` : ''}
---

${project.description}

## Technologies Used

${project.techStack.map(tech => `- ${tech}`).join('\n')}

${project.images && project.images.length > 1 ? `
## Screenshots

${project.images.map(img => `![Screenshot](${img})`).join('\n\n')}
` : ''}
`

    fs.writeFileSync(filepath, frontmatter, 'utf8')
    console.log(`  ✅ Exported: ${filename}`)
    exported++
  })

  console.log(`\n📊 Projects: ${exported} exported, ${skipped} skipped`)
}

/**
 * Main export function
 */
async function exportAll() {
  console.log('🔄 Starting database to MDX export...\n')
  
  try {
    await exportBlogPosts()
    await exportProjects()
    
    console.log('\n✨ Export complete!')
    console.log('📁 Check content/blog/ and content/projects/ directories')
  } catch (error) {
    console.error('\n❌ Export failed:', error)
    process.exit(1)
  }
}

// Run export
exportAll()
