import { connectDB } from '@/lib/db'
import { Message } from '@/lib/models/Message'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

export interface NotificationItem {
  id: string
  type: 'message' | 'request' | 'approval' | 'rejection'
  senderName: string
  text: string
  timestamp: string
  link: string
}

export async function GET() {
  try {
    await connectDB()

    const token = await getAuthToken()
    if (!token) {
      return NextResponse.json({ notifications: [], totalUnread: 0 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ notifications: [], totalUnread: 0 })
    }

    const userId = new mongoose.Types.ObjectId(decoded.userId)
    const items: NotificationItem[] = []

    // 1. Unread messages (with sender name, preview)
    const acceptedRequests = await MentorshipRequest.find({
      status: 'accepted',
      $or: [{ mentorId: userId }, { menteeId: userId }],
    }).select('_id')

    const requestIds = acceptedRequests.map((r) => r._id)
    if (requestIds.length > 0) {
      const unreadMessages = await Message.find({
        mentorshipRequestId: { $in: requestIds },
        senderId: { $ne: userId },
        isRead: false,
      })
        .sort({ createdAt: -1 })
        .limit(20)

      for (const msg of unreadMessages) {
        items.push({
          id: `msg-${msg._id}`,
          type: 'message',
          senderName: msg.senderName || 'Someone',
          text: msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content,
          timestamp: msg.createdAt.toISOString(),
          link: `/chat?requestId=${msg.mentorshipRequestId}`,
        })
      }
    }

    // 2. Pending mentorship requests (as mentor)
    const pendingRequests = await MentorshipRequest.find({
      mentorId: userId,
      status: 'pending',
    })
      .populate<{ menteeId: { name: string } }>('menteeId', 'name')
      .sort({ createdAt: -1 })
      .limit(20)

    for (const req of pendingRequests) {
      const menteeName = (req.menteeId as { name?: string })?.name || 'Someone'
      items.push({
        id: `req-pending-${req._id}`,
        type: 'request',
        senderName: menteeName,
        text: `Requested mentorship${req.subject ? `: ${req.subject}` : ''}`,
        timestamp: req.createdAt.toISOString(),
        link: '/dashboard',
      })
    }

    // 3. Accepted/rejected requests (as mentee) - recent status changes
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const sentResolved = await MentorshipRequest.find({
      menteeId: userId,
      status: { $in: ['accepted', 'rejected'] },
      updatedAt: { $gte: sevenDaysAgo },
    })
      .populate<{ mentorId: { name: string } }>('mentorId', 'name')
      .sort({ updatedAt: -1 })
      .limit(20)

    for (const req of sentResolved) {
      const mentorName = (req.mentorId as { name?: string })?.name || 'A mentor'
      items.push({
        id: `req-${req.status}-${req._id}`,
        type: req.status === 'accepted' ? 'approval' : 'rejection',
        senderName: mentorName,
        text: req.status === 'accepted' ? 'Accepted your mentorship request' : 'Declined your mentorship request',
        timestamp: req.updatedAt.toISOString(),
        link: '/dashboard',
      })
    }

    // Sort by timestamp, latest first
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const notifications = items.slice(0, 30)
    const totalUnread =
      (await Message.countDocuments({
        mentorshipRequestId: { $in: requestIds },
        senderId: { $ne: userId },
        isRead: false,
      })) + pendingRequests.length

    return NextResponse.json({ notifications, totalUnread })
  } catch (error) {
    console.error('[notifications] Error:', error)
    return NextResponse.json({ notifications: [], totalUnread: 0 })
  }
}
