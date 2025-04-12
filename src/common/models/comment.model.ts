import { z } from 'zod';

export const addCommentSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  text: z.string().min(1, 'Comment text cannot be empty'),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
