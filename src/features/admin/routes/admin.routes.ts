import { Router } from 'express';

import { logAdminAction } from '../../../common/middleware/super.admin.middleware.js';
import { ValidZod } from '../../../common/middleware/zod.middleware.js';
import {
  adminCommentDeletionSchema,
  adminGetUsersSchema,
  adminPostIdSchema,
  adminProjectIdSchema,
  adminUserIdSchema,
} from '../../../common/validation/admin.zod.js';
import { handleAdminSignout } from '../../auth/controllers/admin.signout.handler.js';
import {
  handleAdminAnalytics,
  handleAdminDeleteComment,
  handleAdminDeletePost,
  handleAdminDeleteProject,
  handleAdminDeleteUser,
  handleAdminGetAllUsers,
} from '../admin.handlers.js';

const router = Router();

// All admin routes are protected by super admin middleware (applied in main routes)

/**
 * User Management Routes
 */
router.get('/users', ValidZod(adminGetUsersSchema, 'query'), logAdminAction('view_all_users'), handleAdminGetAllUsers);

router.delete(
  '/user/:userId',
  ValidZod(adminUserIdSchema, 'params'),
  logAdminAction('delete_user', 'params.userId'),
  handleAdminDeleteUser,
);

/**
 * Content Moderation Routes
 */
router.delete(
  '/project/:projectId',
  ValidZod(adminProjectIdSchema, 'params'),
  logAdminAction('delete_project', 'params.projectId'),
  handleAdminDeleteProject,
);

router.delete(
  '/post/:postId',
  ValidZod(adminPostIdSchema, 'params'),
  logAdminAction('delete_post', 'params.postId'),
  handleAdminDeletePost,
);

router.delete(
  '/post/:postId/comment/:commentId',
  ValidZod(adminCommentDeletionSchema, 'params'),
  logAdminAction('delete_comment', 'params.commentId', {
    postId: 'params.postId',
  }),
  handleAdminDeleteComment,
);

/**
 * Analytics & Monitoring Routes
 */
router.get('/analytics', logAdminAction('view_analytics'), handleAdminAnalytics);

/**
 * Admin Authentication Routes
 */
router.post('/signout', logAdminAction('admin_signout'), handleAdminSignout);

export default router;
