import { connectDB } from '@/lib/db'
import { Feedback } from '@/lib/models/Feedback'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const mentorId = searchParams.get('mentorId')

    if (!mentorId) {
      return NextResponse.json(
        { error: 'Mentor ID is required' },
        { status: 400 }
      )
    }

    // Fetch all feedback for the mentor
    const feedbacks = await Feedback.find({ mentorId }).populate('menteeId', 'name profilePictureUrl')

    // Calculate average rating
    const averageRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0

    return NextResponse.json({
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalFeedbacks: feedbacks.length,
      feedbacks: feedbacks.map(f => ({
        _id: f._id,
        rating: f.rating,
        comment: f.comment,
        menteeId: f.menteeId._id,
        menteeName: f.menteeId.name,
        menteeProfilePicture: f.menteeId.profilePictureUrl,
        createdAt: f.createdAt,
      })),
    })
  } catch (error) {
    console.error('[v0] Error fetching feedback:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
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
