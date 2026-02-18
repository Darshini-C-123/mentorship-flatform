import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_AUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

function isSafeRedirectPath(path: string | null) {
  if (!path) return false
  if (!path.startsWith('/')) return false
  if (path.startsWith('//')) return false
  if (path.includes('\n') || path.includes('\r')) return false
  return true
}

function encodeState(state: Record<string, unknown>) {
  const json = JSON.stringify(state)
  return Buffer.from(json, 'utf8').toString('base64url')
}

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

  const redirect = url.searchParams.get('redirect')
  const state = isSafeRedirectPath(redirect) ? encodeState({ redirect }) : undefined

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  })
  if (state) params.set('state', state)

  const googleAuthUrl = `${GOOGLE_AUTH_BASE_URL}?${params.toString()}`

  return NextResponse.redirect(googleAuthUrl)
}

