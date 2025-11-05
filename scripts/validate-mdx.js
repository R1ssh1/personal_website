/**
 * MDX Frontmatter Schema Validator
 * 
 * Validates that all MDX files have required frontmatter fields.
 * Catches missing metadata before deployment or content errors.
 * 
 * Usage: node scripts/validate-mdx.js
 */

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// Required fields for each content type
const schemas = {
  blog: ['title', 'summary', 'date', 'tags'],
  projects: ['title', 'summary', 'date', 'technologies']
}

// Optional but recommended fields
const recommended = {
  blog: ['featured', 'readTime'],
  projects: ['featured', 'github', 'demo']
}

/**
 * Validate MDX files in a directory
 */
function validateDirectory(dirPath, type) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`)
    return { errors: 0, warnings: 0, files: 0 }
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx'))
  
  if (files.length === 0) {
    console.log(`ℹ️  No MDX files found in ${type}`)
    return { errors: 0, warnings: 0, files: 0 }
  }

  console.log(`\n📂 Validating ${type} (${files.length} files)`)
  console.log('─'.repeat(50))

  let totalErrors = 0
  let totalWarnings = 0

  files.forEach(file => {
    const filepath = path.join(dirPath, file)
    const fileContent = fs.readFileSync(filepath, 'utf8')
    
    let frontmatter
    try {
      frontmatter = matter(fileContent).data
    } catch (error) {
      console.log(`❌ ${file}: Invalid frontmatter - ${error.message}`)
      totalErrors++
      return
    }

    // Check required fields
    const missingRequired = schemas[type].filter(field => !frontmatter[field])
    
    if (missingRequired.length > 0) {
      console.log(`❌ ${file}:`)
      console.log(`   Missing required: ${missingRequired.join(', ')}`)
      totalErrors++
    }

    // Check recommended fields
    const missingRecommended = recommended[type].filter(field => !frontmatter[field])
    
    if (missingRecommended.length > 0) {
      console.log(`⚠️  ${file}:`)
      console.log(`   Missing recommended: ${missingRecommended.join(', ')}`)
      totalWarnings++
    }

    // Validate field types
    if (frontmatter.date && isNaN(Date.parse(frontmatter.date))) {
      console.log(`❌ ${file}: Invalid date format (use YYYY-MM-DD)`)
      totalErrors++
    }

    if (type === 'blog' && frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      console.log(`❌ ${file}: 'tags' must be an array`)
      totalErrors++
    }

    if (type === 'projects' && frontmatter.technologies && !Array.isArray(frontmatter.technologies)) {
      console.log(`❌ ${file}: 'technologies' must be an array`)
      totalErrors++
    }

    // If no issues, show success
    if (missingRequired.length === 0 && missingRecommended.length === 0) {
      console.log(`✅ ${file}`)
    }
  })

  return { errors: totalErrors, warnings: totalWarnings, files: files.length }
}

/**
 * Main validation function
 */
function validateAll() {
  console.log('🔍 Validating MDX frontmatter...')

  const blogDir = path.join(__dirname, '../content/blog')
  const projectsDir = path.join(__dirname, '../content/projects')

  const blogResults = validateDirectory(blogDir, 'blog')
  const projectsResults = validateDirectory(projectsDir, 'projects')

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 VALIDATION SUMMARY')
  console.log('='.repeat(50))
  
  const totalFiles = blogResults.files + projectsResults.files
  const totalErrors = blogResults.errors + projectsResults.errors
  const totalWarnings = blogResults.warnings + projectsResults.warnings

  console.log(`Files validated: ${totalFiles}`)
  console.log(`❌ Errors: ${totalErrors}`)
  console.log(`⚠️  Warnings: ${totalWarnings}`)

  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('\n✨ All MDX files are valid!')
    process.exit(0)
  } else if (totalErrors === 0) {
    console.log('\n✅ No errors, but some warnings to review')
    process.exit(0)
  } else {
    console.log('\n❌ Validation failed - please fix errors above')
    process.exit(1)
  }
}

// Run validation
validateAll()
