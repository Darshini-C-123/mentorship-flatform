import { connectDB } from '@/lib/db'
import { User } from '@/lib/models/User'
import { generateToken, setAuthCookieOnResponse } from '@/lib/auth'
import { validatePassword } from '@/lib/password-validation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, skills, interests } = await request.json()

    // Validate input
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
    }

    try {
      await connectDB()

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        )
      }

      // Create new user
      const user = new User({
        email,
        password,
        name,
        role,
        bio: '',
        skills: skills || [],
        interests: interests || [],
      })

      await user.save()

      // Generate token
      const token = generateToken(user._id.toString(), user.email)

      const response = NextResponse.json(
        {
          message: 'User registered successfully',
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      )
      setAuthCookieOnResponse(response, token)
      return response
    } catch (dbError: any) {
      console.error('[v0] Database error during registration:', dbError?.message || dbError)
      
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
    console.error('[v0] Registration error:', error)
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )
  }
}
