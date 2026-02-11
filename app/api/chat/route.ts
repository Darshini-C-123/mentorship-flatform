import { connectDB } from '@/lib/db'
import { Message } from '@/lib/models/Message'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import { User } from '@/lib/models/User'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Fetch all messages for the mentorship request
    const messages = await Message.find({ mentorshipRequestId: requestId }).sort({
      createdAt: 1,
    })

    // Mark messages as read for the current user
    await Message.updateMany(
      { mentorshipRequestId: requestId, senderId: { $ne: decoded.userId }, isRead: false },
      { isRead: true }
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[v0] Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const { mentorshipRequestId, content } = await request.json()

    if (!mentorshipRequestId || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is part of this mentorship request
    const mentorshipRequest = await MentorshipRequest.findById(mentorshipRequestId)
    if (!mentorshipRequest) {
      return NextResponse.json(
        { error: 'Mentorship request not found' },
        { status: 404 }
      )
    }

    const isMentor = mentorshipRequest.mentorId.toString() === decoded.userId
    const isMentee = mentorshipRequest.menteeId.toString() === decoded.userId

    if (!isMentor && !isMentee) {
      return NextResponse.json(
        { error: 'Not authorized to send messages in this request' },
        { status: 403 }
      )
    }

    // Get current user info
    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create message
    const message = new Message({
      mentorshipRequestId,
      senderId: decoded.userId,
      senderName: user.name,
      senderRole: isMentor ? 'Mentor' : 'Mentee',
      content: content.trim(),
      isRead: false,
    })

    await message.save()

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
