import { z } from 'zod';

// Sign-up Schema
export const signUpSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email format'),
  freindlyId: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int().positive().optional(), // Ensure `age` is optional or required based on your needs
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  profilePicture: z.string().url('Invalid URL format').optional(),
  coverImage: z.string().url('Invalid URL format').optional(),
  countryOrigin: z.string().optional(),
  profession: z.string().optional(),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

// Login Schema
export const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
export type SignInInput = z.infer<typeof signInSchema>;

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// edit user schema
export const editUserSchema = z.object({
  username: z.string().min(1, 'Username cannot be empty').optional(),
  age: z.number().nullable().optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  profilePicture: z.string().optional(),
  coverImage: z.string().optional(),
  countryOrigin: z.string().optional(),
  friendlyId: z.string().optional(),
  profession: z.string().optional(),
});

export type EditUserInput = z.infer<typeof editUserSchema>;

// user schema

export const userResponeSchema = z.object({
  _id: z.string(),
  mongo_ref: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  profilePicture: z.string().optional(),
  age: z.number().nullable(),
  bio: z.string().optional(),
  createdAt: z.date(),
});
export type UserResponse = z.infer<typeof userResponeSchema>;

export const updateCredentialsSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
});

export const getAllUsersValidationSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(), // Must be a positive integer if provided
  limit: z.string().regex(/^\d+$/).optional(), // Must be a positive integer if provided
});
