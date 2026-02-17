import { connectDB } from '@/lib/db'
import { Message } from '@/lib/models/Message'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET() {
  try {
    await connectDB()

    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const userId = new mongoose.Types.ObjectId(decoded.userId)

    // All mentorship requests where current user is mentor or mentee (only accepted for actual chat)
    const requests = await MentorshipRequest.find({
      status: 'accepted',
      $or: [{ mentorId: userId }, { menteeId: userId }],
    }).select('_id')

    const requestIds = requests.map((r) => r._id)

    if (requestIds.length === 0) {
      return NextResponse.json({ unreadCount: 0 })
    }

    const unreadCount = await Message.countDocuments({
      mentorshipRequestId: { $in: requestIds },
      senderId: { $ne: userId },
      isRead: false,
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('[v0] Error fetching unread count:', error)
    return NextResponse.json({ unreadCount: 0 })
  }
}
