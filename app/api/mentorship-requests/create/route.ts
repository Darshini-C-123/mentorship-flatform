import { connectDB } from '@/lib/db'
import { MentorshipRequest } from '@/lib/models/MentorshipRequest'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Mentorship request - attempting DB connection')
    await connectDB()
    console.log('[v0] Mentorship request - DB connected')

    const token = await getAuthToken()
    console.log('[v0] Auth token retrieved:', token ? 'Yes' : 'No')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log('[v0] Token decoded:', decoded ? 'Valid' : 'Invalid')
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { mentorId, message } = await request.json()

    if (!mentorId) {
      return NextResponse.json(
        { error: 'Mentor ID is required' },
        { status: 400 }
      )
    }

    // Check if requester already has a pending request
    const existingRequest = await MentorshipRequest.findOne({
      $or: [
        { menteeId: decoded.userId, mentorId, status: 'pending' },
        { mentorId: decoded.userId, menteeId: mentorId, status: 'pending' },
      ]
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request with this user' },
        { status: 409 }
      )
    }

    // Create new request
    const mentorshipRequest = new MentorshipRequest({
      menteeId: decoded.userId,
      mentorId,
      message: message || '',
      status: 'pending',
    })

    await mentorshipRequest.save()

    return NextResponse.json(
      {
        message: 'Mentorship request sent successfully',
        request: mentorshipRequest,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating mentorship request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('Could not connect') || errorMessage.includes('connection')) {
      return NextResponse.json(
        { error: 'Database connection error. Please ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create mentorship request: ' + errorMessage },
      { status: 500 }
    )
  }
}
