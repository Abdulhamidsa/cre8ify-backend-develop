import { Request, Response, NextFunction } from 'express';

import { Post } from '../../../common/models/post.model.js';
import { createResponse } from '../../../common/utils/response.handler.js';

/**
 * Debug handler to check what data is being passed and stored
 * GET /post/:postId/debug
 */
export const handleDebugPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const userId = res.locals.userId?.userId || null;

    // Get the post with full data
    const post = await Post.findById(postId).lean();

    if (!post) {
      return res.status(404).json(createResponse(false, { message: 'Post not found' }));
    }

    // Debug information
    const debugInfo = {
      postId: post._id.toString(),
      currentUserId: userId,
      likesArray: post.likes,
      likesCount: post.likes.length,
      likedByUser: userId ? post.likes.some((likeId: unknown) => likeId?.toString() === userId) : false,
      userAuthenticated: !!userId,
      resLocals: {
        hasUserId: !!res.locals.userId,
        userIdStructure: res.locals.userId,
        mongoRef: res.locals.mongoRef,
      }
    };

    res.status(200).json(createResponse(true, debugInfo));
  } catch (error) {
    next(error);
  }
};