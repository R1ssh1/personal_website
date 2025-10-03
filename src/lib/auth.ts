import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { adminUsersDb, adminSessionsDb } from './database-unified'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION)
  const sessionId = await adminSessionsDb.create(userId, expiresAt)

  // Set HTTP-only cookie
  const cookieStore = await cookies()

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_DURATION / 1000,
    path: '/'
  }

  console.log('createSession debug:', {
    sessionId,
    userId,
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions,
    nodeEnv: process.env.NODE_ENV
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, cookieOptions)

  console.log('Cookie set successfully');

  return sessionId
}

export async function getSession(): Promise<{ userId: string; sessionId: string; isAdmin: boolean } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  console.log('getSession debug:', {
    sessionCookieName: SESSION_COOKIE_NAME,
    sessionId: sessionId ? 'present' : 'missing',
    hasValue: !!sessionId
  });

  if (!sessionId) {
    return null
  }

  const session = await adminSessionsDb.getById(sessionId)

  console.log('getSession session lookup:', {
    sessionId,
    sessionExists: !!session,
    session
  });

  if (!session) {
    return null
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    console.log('Session expired, deleting');
    await adminSessionsDb.delete(sessionId)
    cookieStore.delete(SESSION_COOKIE_NAME)
    return null
  }

  // Get user details to check admin status
  const user = await adminUsersDb.getById(session.userId)

  console.log('getSession user lookup:', {
    userId: session.userId,
    userExists: !!user,
    isAdmin: user?.isAdmin,
    isAdminType: typeof user?.isAdmin
  });

  if (!user) {
    return null
  }

  return { userId: session.userId, sessionId, isAdmin: user.isAdmin }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionId) {
    await adminSessionsDb.delete(sessionId)
  }

  // Clear the cookie properly
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
}

export async function authenticateUser(username: string, password: string): Promise<string | null> {
  const user = await adminUsersDb.getByUsername(username)

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)

  if (!isValidPassword) {
    return null
  }

  return user.id
}

export async function requireAuth(): Promise<string> {
  const session = await getSession()

  if (!session) {
    throw new Error('Authentication required')
  }

  return session.userId
}

export async function cleanupExpiredSessions(): Promise<void> {
  await adminSessionsDb.cleanup()
}