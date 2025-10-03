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
}).partial()

// GET /api/admin/certifications/[id] - Get certification by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const certification = certificationsDb.getById(id)

    if (!certification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(certification)
  } catch (error) {
    console.error('Error fetching certification:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certification' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/certifications/[id] - Update certification
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validatedData = certificationsSchema.parse(body)

    const success = certificationsDb.update(id, {
      ...validatedData,
      verificationLink: validatedData.verificationLink || undefined
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }

    const updatedCertification = certificationsDb.getById(id)

    return NextResponse.json(updatedCertification)
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

    console.error('Error updating certification:', error)
    return NextResponse.json(
      { error: 'Failed to update certification' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/certifications/[id] - Delete certification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const success = certificationsDb.delete(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Certification deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.error('Error deleting certification:', error)
    return NextResponse.json(
      { error: 'Failed to delete certification' },
      { status: 500 }
    )
  }
}