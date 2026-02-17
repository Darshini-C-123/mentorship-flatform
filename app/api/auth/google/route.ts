import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectFromEnv = process.env.GOOGLE_REDIRECT_URI

  if (!clientId) {
    console.error('[v0] GOOGLE_CLIENT_ID is not set')
    return NextResponse.json(
      { error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID.' },
      { status: 500 }
    )
  }

  // Fallback: compute redirect URI from the current request if env is missing
  const url = new URL(request.url)
  const computedRedirectUri = `${url.origin}/api/auth/google/callback`
  const redirectUri = redirectFromEnv || computedRedirectUri

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })

  const googleAuthUrl = `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`

  return NextResponse.redirect(googleAuthUrl)
}

