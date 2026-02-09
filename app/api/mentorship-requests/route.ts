import { connectDB } from '@/lib/db'
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

    // Get mentorship requests for the current user (as mentor)
    const requests = await MentorshipRequest.find({
      mentorId: decoded.userId,
    })
      .populate('menteeId', 'name email profilePictureUrl')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      requests,
    })
  } catch (error) {
    console.error('[v0] Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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

    const { requestId, status } = await request.json()

    if (!requestId || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid request ID or status' },
        { status: 400 }
      )
    }

    // Update request status
    const mentorshipRequest = await MentorshipRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    )

    if (!mentorshipRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (mentorshipRequest.mentorId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      message: `Mentorship request ${status}`,
      request: mentorshipRequest,
    })
  } catch (error) {
    console.error('[v0] Error updating request:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}
