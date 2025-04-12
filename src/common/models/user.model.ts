import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  mongoRef: string;
  username: string;
  age: number | null;
  bio: string;
  countryOrigin: string;
  profession: string;
  friendlyId: string;
  deletedAt: Date | null;
  profilePicture: string;
  location: {
    country: string;
    city: string;
  };
  active: boolean;
  coverImage: string;
  completedProfile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    mongoRef: {
      // This is the user's unique identifier
      type: String,
      unique: true,
      required: true,
    },
    bio: {
      type: String,
      required: false,
    },
    countryOrigin: {
      type: String,
      required: false,
    },
    friendlyId: {
      type: String,
      unique: true,
      required: true,
    },
    completedProfile: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    location: {
      country: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
    },
    profession: {
      type: String,
      required: false,
    },
    age: { type: Number, required: false },
    active: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const User = mongoose.model<IUser>('User', UserSchema);
