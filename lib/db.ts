import mongoose from 'mongoose'

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorship'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority' as const,
    }

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongoose) => {
        console.log('[v0] Connected to MongoDB')
        return mongoose
      })
      .catch((error) => {
        console.error('[v0] MongoDB connection error:', error.message)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (error) {
    cached.promise = null
    throw error
  }
}

export function disconnectDB() {
  return mongoose.disconnect()
}

declare global {
  var _mongoose: {
    conn: any | null
    promise: Promise<any> | null
  }
}
