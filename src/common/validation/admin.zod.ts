import { z } from 'zod';

/**
 * Admin validation schemas for request validation
 */

// Get all users validation
export const adminGetUsersSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .regex(/^\d+$/)
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional().default(''),
});

// User ID validation for deletion
export const adminUserIdSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Project ID validation for deletion
export const adminProjectIdSchema = z.object({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
});

// Post ID validation for deletion
export const adminPostIdSchema = z.object({
  postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format'),
});

// Comment deletion validation
export const adminCommentDeletionSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  commentId: z.string().min(1, 'Comment ID is required'),
});

export const adminUserFriendlyIdSchema = z.object({
  friendlyId: z.string().min(1, 'User friendly ID is required'),
});

// Export types
export type AdminGetUsersInput = z.infer<typeof adminGetUsersSchema>;
export type AdminUserIdInput = z.infer<typeof adminUserIdSchema>;
export type AdminProjectIdInput = z.infer<typeof adminProjectIdSchema>;
export type AdminPostIdInput = z.infer<typeof adminPostIdSchema>;
export type AdminCommentDeletionInput = z.infer<typeof adminCommentDeletionSchema>;
