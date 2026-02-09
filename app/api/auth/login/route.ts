import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { generateToken, setAuthCookie } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    try {
      await connectDB()

      const user = await User.findOne({ email })
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const isPasswordValid = await user.comparePassword(password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      const token = generateToken(user._id.toString(), user.email)
      await setAuthCookie(token)

      return NextResponse.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    } catch (dbError: any) {
      console.error('[v0] Database error during login:', dbError?.message || dbError)
      
      // Provide specific error message based on error type
      if (dbError?.message?.includes('ENOTFOUND') || dbError?.message?.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection failed. Ensure your MongoDB Atlas cluster is active and MONGODB_URI is correctly set.' },
          { status: 500 }
        )
      }
      
      if (dbError?.message?.includes('authentication failed')) {
        return NextResponse.json(
          { error: 'MongoDB authentication failed. Check your database username and password.' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Database error: ' + (dbError?.message || 'Unknown error') },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )
  }
}
