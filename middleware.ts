import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/chat']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      // Redirect to login if token is invalid
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export const runtime = 'nodejs'
