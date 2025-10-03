import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Setup endpoint - use POST method',
    instructions: 'Make a POST request to initialize admin user and sample certifications',
    example: 'curl -X POST http://localhost:3001/api/setup'
  })
}

export async function POST() {
  // Redirect to the main setup endpoint
  return NextResponse.redirect(new URL('/api/setup', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}