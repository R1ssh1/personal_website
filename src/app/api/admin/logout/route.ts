import { NextRequest, NextResponse } from 'next/server'
import { adminSessionsDb } from '@/lib/database-unified'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('admin_session')?.value

    if (sessionId) {
      // Delete the session from database
      adminSessionsDb.delete(sessionId)
    }

    // Clear the session cookie properly
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // This expires the cookie immediately
      path: '/' // Ensure we're clearing the cookie at the root path
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}