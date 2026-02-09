import { Router } from 'express';

import { requireSuperAdminAuth } from '../../../common/middleware/admin.auth.middleware.js';
import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import {
  adminCommentDeletionSchema,
  adminPostIdSchema,
  adminProjectIdSchema,
  adminUserFriendlyIdSchema,
  adminUserIdSchema,
} from '../../../common/validation/admin.zod.js';
import {
  handleAdminAnalytics,
  handleAdminDeleteComment,
  handleAdminDeletePost,
  handleAdminDeleteProject,
  handleAdminDeleteUser,
  handleAdminGetAllPosts,
  handleAdminGetAllProjects,
  handleAdminGetAllUsers,
  handleAdminGetPostDetails,
  handleAdminGetUserComments,
  handleAdminGetUserPosts,
  handleAdminGetUserProjects,
} from '../admin.handlers.js';
// Import the flat comments handler
import { handleAdminGetUserCommentsFlat } from '../handlers/comments.flat.handler.js';

const router = Router();

// Apply super admin auth middleware to all routes (handles both authentication and authorization)
router.use(requireSuperAdminAuth);

/**
 * Admin Routes - Bypass all authentication and ownership checks
 * These routes are only accessible by super admins and bypass normal user authentication
 */

// Get all users (admin only)
router.get('/users', handleAdminGetAllUsers);

// Get all posts (admin only) - VIEW BEFORE DELETE
router.get('/posts', handleAdminGetAllPosts);

// Get all projects (admin only) - VIEW BEFORE DELETE
router.get('/projects', handleAdminGetAllProjects);

// Get post details with all comments (admin only) - VIEW COMMENTS BEFORE DELETE
router.get('/post/:postId', ValidZod(adminPostIdSchema, 'params'), handleAdminGetPostDetails);

// Get system analytics (admin only)
router.get('/analytics', handleAdminAnalytics);

// Delete user account (admin only)
router.delete('/user/:userId', ValidZod(adminUserIdSchema, 'params'), handleAdminDeleteUser);

// Delete any project (admin only) - BYPASSES AUTHENTICATION
router.delete('/project/:projectId', ValidZod(adminProjectIdSchema, 'params'), handleAdminDeleteProject);

// Delete any post (admin only) - BYPASSES AUTHENTICATION
router.delete('/post/:postId', ValidZod(adminPostIdSchema, 'params'), handleAdminDeletePost);

// Delete any comment (admin only) - BYPASSES AUTHENTICATION
router.delete(
  '/post/:postId/comment/:commentId',
  ValidZod(adminCommentDeletionSchema, 'params'),
  handleAdminDeleteComment,
);

// USER-SPECIFIC ADMIN ROUTES
// Get posts for a specific user (admin only)
router.get('/user/:friendlyId/posts', ValidZod(adminUserFriendlyIdSchema, 'params'), handleAdminGetUserPosts);

// Get projects for a specific user (admin only)
router.get('/user/:friendlyId/projects', ValidZod(adminUserFriendlyIdSchema, 'params'), handleAdminGetUserProjects);

// Get comments by a specific user (admin only)
router.get('/user/:friendlyId/comments', ValidZod(adminUserFriendlyIdSchema, 'params'), handleAdminGetUserComments);

// Explicit endpoint for flat comments (used by frontend)
router.get(
  '/user/:friendlyId/comments/flat',
  ValidZod(adminUserFriendlyIdSchema, 'params'),
  handleAdminGetUserCommentsFlat,
);

export { router as adminBypassRoutes };
