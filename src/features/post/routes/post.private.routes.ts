import { Router } from 'express';

import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import { addPostSchema } from '../../../common/validation/post.zod.js';
import { fetchAllPostsSchema } from '../../../common/validation/project.zod.js';
import {
  handleAddComment,
  handleAddPost,
  handleDeleteComment,
  handleDeletePost,
  // Add the delete post handler
  handleFetchAllPosts,
  handleGetUserPosts,
  handleLikePost,
} from '../post.handlers.js';

const router = Router();

// Add post
router.post('/post', ValidZod(addPostSchema, 'body'), handleAddPost);

// Get all posts
router.get('/posts', ValidZod(fetchAllPostsSchema, 'query'), handleFetchAllPosts);

// Get user posts
router.get('/user/:friendlyId/posts', handleGetUserPosts);

// Like a post
router.post('/post/like', handleLikePost);

// Add comment
router.post('/post/comment', handleAddComment);

// Delete comment
router.delete('/post/comment/:postId/:commentId', handleDeleteComment);

// Delete post
router.delete('/post/:postId', handleDeletePost);

export default router;
