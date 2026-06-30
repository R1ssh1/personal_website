import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { contactSubmissionsDb } from '@/lib/database-unified'

// POST /api/admin/contact/[id]/read - Mark a message as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const success = await contactSubmissionsDb.markAsRead(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error marking message as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark message as read' },
      { status: 500 }
    )
  }
}
