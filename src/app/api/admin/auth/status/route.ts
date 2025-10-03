import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { authenticated: false, isAdmin: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      isAdmin: true,
      userId: session.userId
    })
  } catch (error) {
    console.error('Auth status check error:', error)
    return NextResponse.json(
      { authenticated: false, isAdmin: false, error: 'Authentication check failed' },
      { status: 500 }
    )
  }
}