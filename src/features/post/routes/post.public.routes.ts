import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { fetchAllPostsSchema } from '../../../common/validation/post.zod.js';
import { handleFetchAllPosts, handleGetUserPosts } from '../post.handlers.js';

const router = Router();

// Public routes for viewing posts (no authentication required)

// Get all posts (public access for admin dashboard, etc.)
router.get('/posts', ValidZod(fetchAllPostsSchema, 'query'), handleFetchAllPosts);

// Get user posts by friendly ID (public access)
router.get('/user/:friendlyId/posts', handleGetUserPosts);

export default router;
