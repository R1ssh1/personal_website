import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { aboutContentDb } from '@/lib/database-unified'
import { z } from 'zod'

const aboutContentSchema = z.object({
  content: z.string().min(1, 'Content is required')
})

// GET /api/admin/about - Get about page content
export async function GET() {
  try {
    const aboutContent = await aboutContentDb.get()
    return NextResponse.json({ content: aboutContent?.content || '' })
  } catch (error) {
    console.error('Error fetching about content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about content' },
      { status: 500 }
    )
  }
}

// POST /api/admin/about - Update about page content
export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth()

    const body = await request.json()
    const validatedData = aboutContentSchema.parse(body)

    await aboutContentDb.upsert(validatedData.content, userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Error updating about content:', error)
    return NextResponse.json(
      { error: 'Failed to update about content' },
      { status: 500 }
    )
  }
}
