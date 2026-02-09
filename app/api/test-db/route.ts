import { connectDB } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    console.log('[v0] Testing MongoDB connection...')
    console.log('[v0] MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
    
    await connectDB()
    
    // Test database connection
    const adminDb = mongoose.connection.db?.admin()
    if (adminDb) {
      const status = await adminDb.ping()
      console.log('[v0] MongoDB ping successful:', status)
    }

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Missing',
      connectionState: mongoose.connection.readyState,
    })
  } catch (error: any) {
    console.error('[v0] MongoDB test error:', error?.message || error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
        mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Missing',
        connectionState: mongoose.connection.readyState,
        hint: 'Check that MongoDB Atlas cluster is active and your connection string is correct',
      },
      { status: 500 }
    )
  }
}
