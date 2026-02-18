import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { generateToken, setAuthCookieOnResponse } from '@/lib/auth'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

function isSafeRedirectPath(path: string | null) {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\n') || path.includes('\r')) return false
  return true
}

function decodeState(state: string | null): { redirect?: string } | null {
  if (!state) return null
  try {
    const json = Buffer.from(state, 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    const state = url.searchParams.get('state')

    if (error) {
      console.error('[v0] Google OAuth error:', error)
      return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url))
    }

    if (!code) {
      console.error('[v0] Google OAuth callback missing code')
      return NextResponse.redirect(new URL('/login?error=google_auth_no_code', request.url))
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectFromEnv = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !clientSecret) {
      console.error('[v0] Google OAuth env vars missing')
      return NextResponse.redirect(new URL('/login?error=google_not_configured', request.url))
    }

    // Compute redirect URI to match the one used when initiating auth
    const computedRedirectUri = `${url.origin}/api/auth/google/callback`
    const redirectUri = redirectFromEnv || computedRedirectUri

    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text()
      console.error('[v0] Failed to exchange Google code for tokens:', text)
      return NextResponse.redirect(new URL('/login?error=google_token_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token as string | undefined

    if (!accessToken) {
      console.error('[v0] Google token response missing access_token')
      return NextResponse.redirect(new URL('/login?error=google_token_missing', request.url))
    }

    // Fetch user profile from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userInfoResponse.ok) {
      const text = await userInfoResponse.text()
      console.error('[v0] Failed to fetch Google user info:', text)
      return NextResponse.redirect(new URL('/login?error=google_userinfo_failed', request.url))
    }

    const profile = await userInfoResponse.json()
    const email = (profile.email as string | undefined)?.toLowerCase()
    const name = (profile.name as string | undefined) || 'Google User'
    const picture = (profile.picture as string | undefined) || ''

    if (!email) {
      console.error('[v0] Google user info missing email')
      return NextResponse.redirect(new URL('/login?error=google_no_email', request.url))
    }

    await connectDB()

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      // Create a random password since Google users won't log in with password
      const randomPassword = Math.random().toString(36).slice(-12)

      user = new User({
        email,
        password: randomPassword,
        name,
        role: 'Mentee', // default role; user can change later
        bio: '',
        skills: [],
        interests: [],
        profilePictureUrl: picture || undefined,
      })

      await user.save()
    }

    const token = generateToken(user._id.toString(), user.email)

    const decodedState = decodeState(state)
    const redirectCandidate =
      (typeof decodedState?.redirect === 'string' && decodedState.redirect) || null
    const redirectPath = isSafeRedirectPath(redirectCandidate) ? redirectCandidate : '/dashboard'
    const redirectUrl = new URL(redirectPath, request.url)
    const response = NextResponse.redirect(redirectUrl)
    setAuthCookieOnResponse(response, token)
    return response
  } catch (err) {
    console.error('[v0] Google OAuth callback error:', err)
    return NextResponse.redirect(new URL('/login?error=google_unknown', request.url))
  }
}

