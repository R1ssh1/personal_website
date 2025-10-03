import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        userId: session.userId,
        sessionId: session.sessionId,
        isAdmin: session.isAdmin,
        isAdminType: typeof session.isAdmin
      } : null,
      cookies: request.headers.get('cookie') || 'no cookies',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json(
      { error: 'Auth test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}