import { connectDB } from '@/lib/db'
import { Feedback } from '@/lib/models/Feedback'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

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

    const { mentorshipRequestId, mentorId, rating, comment } = await request.json()

    if (!mentorshipRequestId || !mentorId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid feedback data' },
        { status: 400 }
      )
    }

    // Create feedback
    const feedback = new Feedback({
      mentorshipRequestId,
      menteeId: decoded.userId,
      mentorId,
      rating,
      comment: comment || '',
    })

    await feedback.save()

    return NextResponse.json(
      {
        message: 'Feedback submitted successfully',
        feedback,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}
