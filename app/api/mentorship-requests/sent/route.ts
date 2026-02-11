import { connectDB } from '@/lib/db'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
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

    // Get mentorship requests sent by the current user (as mentee)
    const sentRequests = await MentorshipRequest.find({
      menteeId: decoded.userId,
    })
      .populate('mentorId', 'name email profilePictureUrl role')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      requests: sentRequests,
    })
  } catch (error) {
    console.error('[v0] Error fetching sent requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}
