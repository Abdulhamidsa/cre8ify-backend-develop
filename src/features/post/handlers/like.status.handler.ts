import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import { Post } from '../../../common/models/post.model.js';
import { createResponse } from '../../../common/utils/response.handler.js';
import { AppError } from '../../../common/errors/app.error.js';

// Schema for validating the request
const checkLikeStatusSchema = z.object({
  postIds: z.array(z.string()).min(1).max(50), // Allow checking up to 50 posts at once
});

/**
 * Handler to check like status for multiple posts
 * POST /post/like-status
 * Body: { postIds: string[] }
 * Returns: { postId: string, likedByUser: boolean }[]
 */
export const handleCheckLikeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postIds } = checkLikeStatusSchema.parse(req.body);
    const userId = res.locals.userId.userId;

    if (!userId) {
      throw new AppError('User authentication required', 401);
    }

    // Fetch posts with only the likes field
    const posts = await Post.find(
      { _id: { $in: postIds } },
      { _id: 1, likes: 1 }
    ).lean();

    // Create like status map
    const likeStatusMap = posts.map(post => ({
      postId: post._id.toString(),
      likedByUser: post.likes.some((likeId: unknown) => likeId?.toString() === userId),
      likesCount: post.likes.length
    }));

    // Include posts that weren't found (they don't exist)
    const foundPostIds = new Set(posts.map(p => p._id.toString()));
    const notFoundPosts = postIds
      .filter(id => !foundPostIds.has(id))
      .map(postId => ({
        postId,
        likedByUser: false,
        likesCount: 0,
        exists: false
      }));

    const allResults = [...likeStatusMap, ...notFoundPosts];

    res.status(200).json(createResponse(true, {
      likeStatuses: allResults
    }));
  } catch (error) {
    next(error);
  }
};