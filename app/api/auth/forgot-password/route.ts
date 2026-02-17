import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { PasswordResetToken } from '@/lib/models/PasswordResetToken'
import { sendPasswordResetEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
const TOKEN_EXPIRY_HOURS = 1

/**
 * POST /api/auth/forgot-password
 * Body: { email: string }
 * Always returns 200 with success message to prevent email enumeration.
 * Sends reset email only if the user exists; token is hashed and expires in 1 hour.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a reset link.' },
        { status: 200 }
      )
    }

    let dbConnected = false
    try {
      await connectDB()
      dbConnected = true
    } catch (dbErr) {
      console.error('[forgot-password] Database error:', dbErr)
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a reset link.' },
        { status: 200 }
      )
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a reset link.' },
        { status: 200 }
      )
    }

    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = await bcrypt.hash(rawToken, 10)
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    })

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    if (!baseUrl && request.headers.get('host')) {
      const proto = request.headers.get('x-forwarded-proto') || 'http'
      baseUrl = `${proto}://${request.headers.get('host')}`
    }
    if (!baseUrl && process.env.VERCEL_URL) baseUrl = `https://${process.env.VERCEL_URL}`
    if (!baseUrl) baseUrl = 'http://localhost:3000'
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password/${rawToken}`

    await sendPasswordResetEmail(user.email, resetLink)

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive a reset link.' },
      { status: 200 }
    )
  } catch (err) {
    console.error('[forgot-password] Error:', err)
    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive a reset link.' },
      { status: 200 }
    )
  }
}
