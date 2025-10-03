const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = path.join(process.cwd(), 'data', 'portfolio.db')
const db = new Database(DB_PATH)

console.log('PROJECTS SCHEMA:')
db.prepare('PRAGMA table_info(projects)').all().forEach(col => {
  console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}`)
})

console.log('\nBLOG_POSTS SCHEMA:')
db.prepare('PRAGMA table_info(blog_posts)').all().forEach(col => {
  console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}`)
})

console.log('\nSAMPLE PROJECT DATA:')
const projects = db.prepare('SELECT * FROM projects LIMIT 1').all()
if (projects.length > 0) {
  console.log('Available columns:', Object.keys(projects[0]))
  console.log('Sample data:', projects[0])
}

console.log('\nSAMPLE BLOG DATA:')
const blogs = db.prepare('SELECT * FROM blog_posts LIMIT 1').all()
if (blogs.length > 0) {
  console.log('Available columns:', Object.keys(blogs[0]))
  console.log('Sample data:', blogs[0])
}

db.close()