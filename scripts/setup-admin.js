const { adminUsersDb } = require('../src/lib/database')
const { hashPassword } = require('../src/lib/auth')

async function setupAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'password123'

  // Check if admin user already exists
  const existingUser = adminUsersDb.getByUsername(username)

  if (existingUser) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  const passwordHash = await hashPassword(password)
  const userId = adminUsersDb.create(username, passwordHash)

  console.log('Admin user created successfully!')
  console.log(`Username: ${username}`)
  console.log(`User ID: ${userId}`)
  console.log('You can now log in to /admin with these credentials.')
}

setupAdmin().catch(console.error)