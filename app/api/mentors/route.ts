import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { mockMentors } from '@/lib/mock-data'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get all mentors (users with Mentor or Both role)
    const mentors = await User.find({
      role: { $in: ['Mentor', 'Both'] },
    }).select('name bio role skills interests profilePictureUrl rating')

    return NextResponse.json({
      mentors: mentors.length > 0 ? mentors : mockMentors,
    })
  } catch (error) {
    console.error('[v0] Error fetching mentors:', error)
    // Return mock data as fallback
    return NextResponse.json({
      mentors: mockMentors,
    })
  }
}
