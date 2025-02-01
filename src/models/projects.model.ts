import mongoose, { Document, Model, Schema } from 'mongoose';

// Extend AddProject with Mongoose-specific fields
export interface ProjectDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  url: string;
  media: { url: string }[];
  thumbnail?: string;
  tags: mongoose.Types.ObjectId[];
  createdAt: Date;
  feedbackAllowed: boolean;
  feedback: {
    userId: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  }[];
  updatedAt: Date;
}

const projectSchema: Schema<ProjectDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    url: { type: String, required: false },

    media: [
      {
        url: {
          type: String,
          required: true,
        },
      },
    ],
    thumbnail: {
      type: String,
    },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    feedbackAllowed: { type: Boolean, default: false },
    feedback: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: async (_doc, ret) => {
        delete ret.__v; // Remove __v globally
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v; // Remove __v globally
        return ret;
      },
    },
  },
);

// Create the model
export const Project: Model<ProjectDocument> = mongoose.model<ProjectDocument>('Project', projectSchema);
