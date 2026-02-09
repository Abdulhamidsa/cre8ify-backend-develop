import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { addPostSchema, fetchAllPostsSchema } from '../../../common/validation/post.zod.js';
import {
  handleAddComment,
  handleAddPost,
  handleDeleteComment,
  handleDeletePost,
  handleFetchAllPosts,
  handleGetUserPosts,
  handleLikePost,
} from '../post.handlers.js';
import { handleCheckLikeStatus } from '../handlers/like.status.handler.js';
import { handleDebugPost } from '../handlers/debug.post.handler.js';
import { handleDebugAuthStatus } from '../handlers/debug.auth.handler.js';

const router = Router();

// Add post
router.post('/post', ValidZod(addPostSchema, 'body'), handleAddPost);

// Get all posts (authenticated version - shows correct like status)
router.get('/posts', ValidZod(fetchAllPostsSchema, 'query'), handleFetchAllPosts);

// Get user posts (private - requires auth for personalized view)
router.get('/user/:friendlyId/posts', handleGetUserPosts);

// Like a post
router.post('/post/like', handleLikePost);

// Check like status for multiple posts
router.post('/post/like-status', handleCheckLikeStatus);

// Add comment
router.post('/post/comment', handleAddComment);

// Delete comment
router.delete('/post/comment/:postId/:commentId', handleDeleteComment);

// Delete post
router.delete('/post/:postId', handleDeletePost);

// Debug endpoint (remove in production)
router.get('/post/:postId/debug', handleDebugPost);

// Debug authentication status
router.get('/debug/auth-status', handleDebugAuthStatus);

export default router;
