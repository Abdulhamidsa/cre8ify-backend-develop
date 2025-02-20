import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface CommentSubdoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId | PopulatedUser; // ✅ Allow both ObjectId and populated user
  text: string;
  createdAt: Date;
}

export interface PostBase {
  content?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends PostBase, Document {
  userId: Types.ObjectId | PopulatedUser; // ✅ Allow both
  likes: Types.ObjectId[];
  comments: CommentSubdoc[];
}

export interface PopulatedPostDocument extends PostBase, Document {
  userId: PopulatedUser;
  comments: Array<{
    _id: string;
    userId: PopulatedUser;
    text: string;
    createdAt: Date;
  }>;
}

const commentSchema = new Schema<CommentSubdoc>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    _id: true,
  },
);

const postSchema: Schema<PostDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      trim: false,
    },
    image: {
      type: String,
      trim: true,
      required: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema], // Subdocument array
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const Post: Model<PostDocument> = mongoose.model<PostDocument>('Post', postSchema);

export interface PopulatedUser {
  _id: string;
  username: string;
  profilePicture: string;
}

export interface CommentSubdoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId | PopulatedUser; // ✅ Allow both ObjectId and populated user
  text: string;
  createdAt: Date;
}

export interface PostBase {
  content?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostDocument extends PostBase, Document {
  userId: Types.ObjectId | PopulatedUser; // ✅ Allow both
  likes: Types.ObjectId[];
  comments: CommentSubdoc[];
}
