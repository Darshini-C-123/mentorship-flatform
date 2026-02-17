import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import { Message } from '@/lib/models/Message'
import { Feedback } from '@/lib/models/Feedback'
import { PasswordResetToken } from '@/lib/models/PasswordResetToken'
import { getAuthToken, verifyToken, clearAuthCookie } from '@/lib/auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

/**
 * DELETE /api/user/delete
 * Identifies the logged-in user via session (JWT auth-token cookie; decoded payload has userId and email).
 * Cascading: deletes user's messages, mentorship requests (as sender/mentee or receiver/mentor), feedback, then the user.
 */
export async function DELETE() {
  try {
    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Session expired or invalid. Please log in again.' },
        { status: 401 }
      )
    }

    const userId = decoded.userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session.' },
        { status: 401 }
      )
    }

    const objectId = new mongoose.Types.ObjectId(userId)

    try {
      await connectDB()
    } catch (dbError: unknown) {
      const message = dbError instanceof Error ? dbError.message : 'Database connection failed'
      console.error('[delete-account] Database connection error:', message)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      )
    }

    const user = await User.findById(objectId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found or already deleted.' },
        { status: 404 }
      )
    }

    // 1) Mentorship requests where user is mentee or mentor
    const requestIds = await MentorshipRequest.find({
      $or: [{ menteeId: objectId }, { mentorId: objectId }],
    }).distinct('_id')

    // 2) Delete messages in those conversations (and any messages sent by this user)
    await Message.deleteMany({
      $or: [
        { mentorshipRequestId: { $in: requestIds } },
        { senderId: objectId },
      ],
    })

    // 3) Delete mentorship requests
    await MentorshipRequest.deleteMany({
      $or: [{ menteeId: objectId }, { mentorId: objectId }],
    })

    // 4) Delete feedback where user is mentee or mentor
    await Feedback.deleteMany({
      $or: [{ menteeId: objectId }, { mentorId: objectId }],
    })

    // 5) Delete any password reset tokens for this user
    await PasswordResetToken.deleteMany({ userId: objectId })

    // 6) Delete the user
    await User.findByIdAndDelete(objectId)

    await clearAuthCookie()

    return NextResponse.json({
      message: 'Account deleted successfully.',
    })
  } catch (error) {
    console.error('[delete-account] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again later.' },
      { status: 500 }
    )
  }
}
