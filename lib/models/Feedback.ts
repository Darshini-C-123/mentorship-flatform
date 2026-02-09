import mongoose, { Schema, Document } from 'mongoose'

export interface IFeedback extends Document {
  mentorshipRequestId: mongoose.Types.ObjectId
  menteeId: mongoose.Types.ObjectId
  mentorId: mongoose.Types.ObjectId
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema(
  {
    mentorshipRequestId: {
      type: mongoose.Types.ObjectId,
      ref: 'MentorshipRequest',
      required: true,
    },
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

export const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)
