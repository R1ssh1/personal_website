import { NextResponse } from 'next/server'
import { certificationsDb } from '@/lib/database-unified'

// GET /api/certifications - Get all certifications (public)
export async function GET() {
  try {
    const certifications = certificationsDb.getAll()
    return NextResponse.json(certifications)
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    )
  }
}