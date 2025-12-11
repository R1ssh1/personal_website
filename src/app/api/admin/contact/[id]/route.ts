import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { contactSubmissionsDb } from '@/lib/database-unified'

// DELETE /api/admin/contact/[id] - Delete a contact submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const success = await contactSubmissionsDb.delete(id)

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

    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
