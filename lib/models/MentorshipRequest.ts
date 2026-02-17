import mongoose, { Schema, Document } from 'mongoose'

export interface IMentorshipRequest extends Document {
  menteeId: mongoose.Types.ObjectId
  mentorId: mongoose.Types.ObjectId
  status: 'pending' | 'accepted' | 'rejected'
  subject: string
  message: string
  createdAt: Date
  updatedAt: Date
}

const MentorshipRequestSchema = new Schema(
  {
    menteeId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    subject: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

export const MentorshipRequest =
  mongoose.models.MentorshipRequest ||
  mongoose.model<IMentorshipRequest>('MentorshipRequest', MentorshipRequestSchema)
