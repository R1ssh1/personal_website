import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminSessionsDb, adminUsersDb } from '@/lib/database-unified'

export async function middleware(request: NextRequest) {
  // Only apply middleware to admin dashboard routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const sessionId = request.cookies.get('admin_session')?.value

    if (!sessionId) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Check if session exists and is not expired
    const session = await adminSessionsDb.getById(sessionId)
    if (!session || new Date(session.expiresAt) < new Date()) {
      // Clean up expired session
      if (session) {
        adminSessionsDb.delete(sessionId)
      }

      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.set('admin_session', '', {
        maxAge: 0,
        path: '/'
      })
      return response
    }

    // Check if the user still exists and is an admin
    const user = await adminUsersDb.getById(session.userId)
    if (!user || !user.isAdmin) {
      // Clean up invalid session
      adminSessionsDb.delete(sessionId)

      const response = NextResponse.redirect(new URL('/admin', request.url))
      response.cookies.set('admin_session', '', {
        maxAge: 0,
        path: '/'
      })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/dashboard/:path*'
}