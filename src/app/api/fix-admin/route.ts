import { NextRequest, NextResponse } from 'next/server'
import { adminUsersDb } from '@/lib/database'

export async function GET() {
  return POST()
}

export async function POST() {
  try {
    // Get the admin user
    const adminUser = adminUsersDb.getByUsername('admin')

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    console.log('Current admin user:', adminUser)

    // Update the user's admin status directly in the database
    const db = require('@/lib/database').db
    const stmt = db.prepare('UPDATE admin_users SET is_admin = 1 WHERE username = ?')
    const result = stmt.run('admin')

    console.log('Update result:', result)

    // Verify the update
    const updatedUser = adminUsersDb.getByUsername('admin')
    console.log('Updated admin user:', updatedUser)

    if (result.changes > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin user updated successfully',
        changes: result.changes,
        before: { isAdmin: adminUser.isAdmin },
        after: { isAdmin: updatedUser?.isAdmin }
      })
    } else {
      return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 })
    }
  } catch (error) {
    console.error('Fix admin error:', error)
    return NextResponse.json(
      { error: 'Failed to fix admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}