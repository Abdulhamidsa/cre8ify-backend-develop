import mongoose from 'mongoose';
import { z } from 'zod';

import { signInSchema, signUpSchema } from '../validation/user.zod.js';

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof signInSchema>;

export type RefreshTokenResult = {
  accessToken: string;
  refreshToken?: string;
};
export type SignUpResult = {
  accessToken: string;
  refreshToken: string;
};
export type LoginResult = {
  accessToken: string;
  refreshToken: string;
};

export type AddProject = {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  projectUrl: string;
  projectImage: [{ url: string }];
  projectThumbnail?: string;
  tags: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
};
export type Tag = {
  id: string;
  name: string;
};
export type ProjectType = {
  _id: string;
  title: string;
  description: string;
  url: string;
  media: Array<{ url: string }>;
  thumbnail: string;
  tags: Tag[]; // Updated to use the `Tag` type
  createdAt: Date;
  updatedAt: Date;
};
export type PostType = {
  id: string; // Transformed from `_id`
  userId: {
    _id: string;
    username: string;
    profilePicture: string; // URL to the profile picture
  };
  content?: string;
  image?: string; // URL to the post image
  createdAt: Date;
  updatedAt: Date;
};

export type UserType = {
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
};
