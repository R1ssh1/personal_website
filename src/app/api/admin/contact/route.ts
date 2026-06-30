import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { contactSubmissionsDb } from '@/lib/database-unified'

// GET /api/admin/contact - Get all contact submissions (admin only)
export async function GET() {
  try {
    await requireAuth()

    const submissions = await contactSubmissionsDb.getAll()
    return NextResponse.json({ submissions })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact submissions' },
      { status: 500 }
    )
  }
}
