import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  mentorshipRequestId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  senderName: string
  senderRole: 'Mentor' | 'Mentee'
  content: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema(
  {
    mentorshipRequestId: {
      type: mongoose.Types.ObjectId,
      ref: 'MentorshipRequest',
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['Mentor', 'Mentee'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

export const Message =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
