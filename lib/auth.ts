import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
export const AUTH_COOKIE_NAME = 'auth-token'

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
  cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  }
}

export function setAuthCookieOnResponse(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())
}

export function clearAuthCookieOnResponse(response: NextResponse) {
  response.cookies.delete(AUTH_COOKIE_NAME)
}
