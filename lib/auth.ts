import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    console.error('[v0] Token verification failed:', error)
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth-token')?.value || null
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
