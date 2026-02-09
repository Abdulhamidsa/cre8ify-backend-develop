import { RequestHandler } from 'express';

import { AppError } from '../../common/errors/app.error.js';
import { createResponse } from '../../common/utils/response.handler.js';
import {
  adminDeletePostService,
  adminDeleteProjectService,
  adminDeleteUserService,
  adminGetAllPostsService,
  adminGetAllProjectsService,
  adminGetAllUsersService,
  adminGetAnalyticsService,
  adminGetPostDetailsService,
  adminGetUserCommentsFlat,
  // adminGetUserCommentsService, // Commented out as it's unused
  adminGetUserPostsService,
  adminGetUserProjectsService,
} from './admin.service.js';

/**
 * Get all users (Admin only)
 */
export const handleAdminGetAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    if (limit > 100) {
      throw new AppError('Limit cannot exceed 100 users per page', 400);
    }

    const result = await adminGetAllUsersService(page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Force delete/deactivate user (Admin only)
 */
export const handleAdminDeleteUser: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const adminMongoRef = res.locals.mongoRef;

    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    await adminDeleteUserService(userId, adminMongoRef);

    res.status(200).json(
      createResponse(true, {
        message: 'User has been successfully deactivated',
        action: 'user_deactivated',
        targetUserId: userId,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete any project (Admin only)
 */
export const handleAdminDeleteProject: RequestHandler = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const adminMongoRef = res.locals.mongoRef;

    if (!projectId) {
      throw new AppError('Project ID is required', 400);
    }

    await adminDeleteProjectService(projectId, adminMongoRef);

    res.status(200).json(
      createResponse(true, {
        message: 'Project has been successfully deleted',
        action: 'project_deleted',
        projectId,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete any post (Admin only)
 */
export const handleAdminDeletePost: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const adminMongoRef = res.locals.mongoRef;

    if (!postId) {
      throw new AppError('Post ID is required', 400);
    }

    await adminDeletePostService(postId, adminMongoRef);

    res.status(200).json(
      createResponse(true, {
        message: 'Post has been successfully deleted',
        action: 'post_deleted',
        postId,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get system analytics (Admin only)
 */
export const handleAdminAnalytics: RequestHandler = async (_req, res, next) => {
  try {
    const adminMongoRef = res.locals.mongoRef;

    const analytics = await adminGetAnalyticsService(adminMongoRef);

    res.status(200).json(createResponse(true, analytics));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all posts (Admin only)
 */
export const handleAdminGetAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    if (limit > 100) {
      throw new AppError('Limit cannot exceed 100 posts per page', 400);
    }

    const result = await adminGetAllPostsService(page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects (Admin only)
 */
export const handleAdminGetAllProjects: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    if (limit > 100) {
      throw new AppError('Limit cannot exceed 100 projects per page', 400);
    }

    const result = await adminGetAllProjectsService(page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Get post details with all comments (Admin only)
 */
export const handleAdminGetPostDetails: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const adminMongoRef = res.locals.mongoRef;

    const result = await adminGetPostDetailsService(postId, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

// USER-SPECIFIC ADMIN HANDLERS
export const handleAdminGetUserPosts: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    const result = await adminGetUserPostsService(friendlyId, page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};
export const handleAdminGetUserProjects: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    const result = await adminGetUserProjectsService(friendlyId, page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

export const handleAdminGetUserComments: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string) || '';
    const adminMongoRef = res.locals.mongoRef;

    // Use the flat comments structure that frontend expects
    const result = await adminGetUserCommentsFlat(friendlyId, page, limit, search, adminMongoRef);

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment from any post (Admin only)
 */
export const handleAdminDeleteComment: RequestHandler = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const adminMongoRef = res.locals.mongoRef;

    if (!postId || !commentId) {
      throw new AppError('Post ID and Comment ID are required', 400);
    }

    // Import Post model dynamically to avoid circular dependencies
    const { Post } = await import('../../common/models/post.model.js');

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const commentIndex = post.comments.findIndex((comment) => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      throw new AppError('Comment not found', 404);
    }

    // Store comment info for logging
    const commentInfo = post.comments[commentIndex];

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    // Log admin action
    const Logger = (await import('../../common/utils/logger.js')).default;
    Logger.warn('Admin deleted comment', {
      adminUser: adminMongoRef,
      action: 'delete_comment',
      postId,
      commentId,
      commentUserId: commentInfo.userId,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json(
      createResponse(true, {
        message: 'Comment has been successfully deleted',
        action: 'comment_deleted',
        postId,
        commentId,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    next(error);
  }
};
