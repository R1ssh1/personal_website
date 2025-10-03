import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { certificationsDb } from '@/lib/database-unified'
import { z } from 'zod'

const certificationsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expirationDate: z.string().optional(),
  verificationLink: z.string().url().optional().or(z.literal('')),
  description: z.string().min(1, 'Description is required'),
  tags: z.array(z.string()),
  imageUrl: z.string().min(1, 'Image URL is required')
})

// GET /api/admin/certifications - Get all certifications
export async function GET() {
  try {
    const certifications = await certificationsDb.getAll()
    return NextResponse.json(certifications)
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    )
  }
}

// POST /api/admin/certifications - Create new certification
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()
    const validatedData = certificationsSchema.parse(body)

    const id = await certificationsDb.create({
      ...validatedData,
      verificationLink: validatedData.verificationLink || undefined
    })

    const certification = await certificationsDb.getById(id)

    return NextResponse.json(certification, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.error('Error creating certification:', error)
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    )
  }
}