import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { getAuthToken, verifyToken, clearAuthCookie } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Feedback } from '@/lib/models/Feedback'
import { Message } from '@/lib/models/Message'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import mongoose from 'mongoose'

export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = new mongoose.Types.ObjectId(decoded.userId)

    // Delete related data: Feedback, Messages (in conversations involving user), MentorshipRequests, then User
    await Feedback.deleteMany({
      $or: [{ mentorId: userId }, { menteeId: userId }],
    })

    const requestIds = await MentorshipRequest.find(
      { $or: [{ mentorId: userId }, { menteeId: userId }] },
      { _id: 1 }
    ).distinct('_id')
    if (requestIds.length > 0) {
      await Message.deleteMany({ mentorshipRequestId: { $in: requestIds } })
    }
    await Message.deleteMany({ senderId: userId })
    await MentorshipRequest.deleteMany({
      $or: [{ mentorId: userId }, { menteeId: userId }],
    })

    const deletedUser = await User.findByIdAndDelete(userId)
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await clearAuthCookie()

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('[v0] Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
