import { connectDB } from '@/lib/db'
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

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('[v0] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
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

    const { name, bio, skills, interests, profilePictureUrl } = await request.json()

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(skills && { skills }),
        ...(interests && { interests }),
        ...(profilePictureUrl && { profilePictureUrl }),
      },
      { new: true }
    ).select('-password')

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    console.error('[v0] Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
