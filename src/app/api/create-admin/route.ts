import { NextResponse } from 'next/server'
import { adminUsersDb } from '@/lib/database'
import { hashPassword } from '@/lib/auth'

export async function POST() {
  try {
    // Force create admin user
    const username = 'admin'
    const password = 'portfolio123'

    // Check if user already exists
    const existingUser = adminUsersDb.getByUsername(username)
    if (existingUser) {
      return NextResponse.json({
        message: 'Admin user already exists',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          isAdmin: existingUser.isAdmin
        }
      })
    }

    // Create new admin user
    const passwordHash = await hashPassword(password)
    const userId = adminUsersDb.create(username, passwordHash, true) // explicitly set isAdmin to true

    return NextResponse.json({
      message: 'Admin user created successfully',
      userId,
      credentials: {
        username,
        password: 'Use the password you provided'
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}