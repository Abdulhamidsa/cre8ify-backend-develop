import { z } from 'zod';

// Validation schema for adding a post
export const addPostSchema = z
  .object({
    content: z.string().optional(), // Optional text content

    image: z
      .union([
        z.string().url('Invalid URL for image.'), // Valid URL
        z.literal(''), // Accept empty string
      ])
      .optional()
      .transform((val) => (val === '' ? undefined : val)), // Convert "" to undefined
  })
  .refine((data) => data.content || data.image, {
    message: 'At least one of "content" or "image" is required.',
    path: ['content'], // Points the error to the content field
  });

export type AddPostInput = z.infer<typeof addPostSchema>;

// Validation schema for fetching all posts
export const fetchAllPostsSchema = z.object({
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val > 0), {
      message: 'Limit must be a positive integer.',
    }),
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val > 0), {
      message: 'Page must be a positive integer.',
    }),
  cursor: z.string().optional(),
  lastId: z.string().optional(), // <-- Add this line
});

export type FetchAllPostsQuery = z.infer<typeof fetchAllPostsSchema>;
