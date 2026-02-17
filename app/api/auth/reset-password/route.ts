import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { PasswordResetToken } from '@/lib/models/PasswordResetToken'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

/**
 * GET /api/auth/reset-password?token=...
 * Returns { valid: boolean } for the given token (not expired, exists).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token || token.length < 32) {
    return NextResponse.json({ valid: false }, { status: 200 })
  }
  try {
    await connectDB()
    const tokens = await PasswordResetToken.find({ expiresAt: { $gt: new Date() } })
    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.tokenHash)
      if (match) {
        return NextResponse.json({ valid: true }, { status: 200 })
      }
    }
    return NextResponse.json({ valid: false }, { status: 200 })
  } catch (err) {
    console.error('[reset-password] Validate error:', err)
    return NextResponse.json({ valid: false }, { status: 200 })
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 * Validates token, updates user password (hashed with bcrypt), deletes the token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''
    if (!token || token.length < 32) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    await connectDB()

    const allTokens = await PasswordResetToken.find({ expiresAt: { $gt: new Date() } })
    let matchedRecord: { userId: mongoose.Types.ObjectId; _id: mongoose.Types.ObjectId } | null = null
    for (const t of allTokens) {
      const match = await bcrypt.compare(token, t.tokenHash)
      if (match) {
        matchedRecord = { userId: t.userId as mongoose.Types.ObjectId, _id: t._id as mongoose.Types.ObjectId }
        break
      }
    }

    if (!matchedRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await User.findByIdAndUpdate(matchedRecord.userId, { password: hashedPassword })
    await PasswordResetToken.findByIdAndDelete(matchedRecord._id)

    return NextResponse.json({ message: 'Password updated. You can log in with your new password.' }, { status: 200 })
  } catch (err) {
    console.error('[reset-password] Error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
