import { z } from 'zod';

// Reusable schemas for consistency
const mediaSchema = z.object({
  url: z.union([z.string().url('Invalid URL format.'), z.literal('')]).default(''),
});

const tagSchema = z.object({
  id: z.string().min(1, 'Tag ID is required.'),
  name: z.string().min(1, 'Tag name is required.'),
});

const userSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  profilePicture: z
    .union([z.string().url('Invalid URL format.'), z.literal('')])
    .nullable()
    .default(null),
  profession: z.string().min(1, 'Profession is required.').default('Not specified'),
  friendlyId: z.string().min(1, 'Friendly ID is required.'),
});

export const fetchedProjectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  url: z.union([z.string().url('Invalid URL format.'), z.literal('')]).default(''),
  media: z.array(mediaSchema).min(1, 'At least one image is required.'),
  thumbnail: z
    .union([z.string().url('Invalid thumbnail URL.'), z.literal('')])
    .default('https://default-thumbnail.com'),
  tags: z
    .array(
      z.union([
        z.string().min(1, 'Tag name is required.'), // Allow string tags
        tagSchema, // Or complete tag objects
      ]),
    )
    .optional()
    .default([]),
  feedbackAllowed: z.boolean().default(false),
  feedback: z
    .array(
      z.object({
        userId: z.string().min(1, 'User ID is required.'),
        comment: z.string().min(1, 'Feedback comment is required.'),
        createdAt: z.date().default(() => new Date()),
      }),
    )
    .optional()
    .default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type FetchedProjectType = z.infer<typeof fetchedProjectSchema>;

export const fetchProjectWithUser = fetchedProjectSchema.extend({
  user: userSchema.nullable().default(null),
});

export type fetchProjectWithUserType = z.infer<typeof fetchProjectWithUser>;

// Common query validation function
const numberQueryParam = (paramName: string) =>
  z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), { message: `${paramName} must be a number.` })
    .transform((val) => (val ? Number(val) : undefined));

export const fetchedProjectQuerySchema = z.object({
  limit: numberQueryParam('Limit'),
  page: numberQueryParam('Page'),
});

export type FetchedProjectQueryType = z.infer<typeof fetchedProjectQuerySchema>;

export const addProjectSchema = fetchedProjectSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .extend({
    title: z.string().min(1, 'Title is required.'),
    description: z.string().min(1, 'Description is required.'),
    tags: z
      .array(
        z.union([
          z.string().min(1, 'Tag name is required.'), // Accept string tags
          tagSchema, // Accept complete tag objects
        ]),
      )
      .optional()
      .default([]),
    feedbackAllowed: z.boolean().default(false),
  });

export type AddProjectInput = z.infer<typeof addProjectSchema>;

export const mongoIdValidationSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ObjectId');
export const getProjectValidationSchema = z.object({ id: mongoIdValidationSchema });

export const editProjectValidationSchema = fetchedProjectSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EditProjectInput = z.infer<typeof editProjectValidationSchema>;

export const projectIdValidationSchema = z.object({ id: mongoIdValidationSchema });

export const fetchAllPostsSchema = z.object({
  limit: numberQueryParam('Limit'),
  page: numberQueryParam('Page'),
});

export type FetchAllPostsQuery = z.infer<typeof fetchAllPostsSchema>;
