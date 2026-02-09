import mongoose, { Schema, Document } from 'mongoose'
import bcryptjs from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  bio: string
  role: 'Mentor' | 'Mentee' | 'Both'
  skills: string[]
  interests: string[]
  profilePictureUrl: string
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['Mentor', 'Mentee', 'Both'],
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    profilePictureUrl: {
      type: String,
      default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    },
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
    return
  }

  try {
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password)
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
