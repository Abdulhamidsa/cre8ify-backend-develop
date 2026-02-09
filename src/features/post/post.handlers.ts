import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { AppError } from '../../common/errors/app.error.js';
import { addCommentSchema } from '../../common/models/comment.model.js';
import { Post } from '../../common/models/post.model.js';
import { createResponse } from '../../common/utils/response.handler.js';
import { fetchAllPostsSchema } from '../../common/validation/post.zod.js';
import { addPostService } from './services/post.add.service.js';
import { fetchAllPostsService } from './services/post.get.all.service.js';
import { getAllUserPosts } from './services/post.get.user.service.js';

export const handleAddPost: RequestHandler = async (req, res, next) => {
  const mongoRef = res.locals.mongoRef;
  const validatedData = req.body;

  try {
    const post = await addPostService(mongoRef, validatedData);
    res.status(201).json(createResponse(true, post));
  } catch (error) {
    next(error);
  }
};
export const handleFetchAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const { limit, page } = fetchAllPostsSchema.parse(req.query);
    
    // Robust user ID extraction with multiple fallbacks
    let userId: string | null = null;
    
    // Method 1: Check res.locals.userId.userId (current expected structure)
    if (res.locals?.userId?.userId) {
      userId = res.locals.userId.userId;
    }
    // Method 2: Check if res.locals.userId is the actual user ID string
    else if (typeof res.locals?.userId === 'string') {
      userId = res.locals.userId;
    }
    // Method 3: Check res.locals.user.userId (alternative structure)
    else if (res.locals?.user?.userId) {
      userId = res.locals.user.userId;
    }
    // Method 4: Extract from mongoRef if available
    else if (res.locals?.mongoRef) {
      // We'll need to convert mongoRef to userId if needed
      // For now, just log this case
      console.log('Found mongoRef but no userId:', res.locals.mongoRef);
    }

    // Debug logging
    console.log('Posts Handler Debug:', {
      hasResLocals: !!res.locals,
      userId,
      resLocalsStructure: res.locals,
      extractedUserId: userId,
    });

    const postsData = await fetchAllPostsService({ limit, page }, userId);

    res.status(200).json(createResponse(true, postsData));
  } catch (error) {
    next(error);
  }
};

export const handleLikePost: RequestHandler = async (req, res, next) => {
  const { postId } = req.body;
  const userId = res.locals.userId.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Check if user already liked
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    // Return the updated post with `likedByUser` and `likesCount`
    const likedByUser = post.likes.some((likeId) => likeId.toString() === userId);
    res.status(200).json({
      success: true,
      post: {
        ...post.toObject(),
        likedByUser,
        likesCount: post.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleAddComment: RequestHandler = async (req, res, next) => {
  try {
    const { postId, text } = addCommentSchema.parse(req.body);
    const userId = res.locals.userId.userId;
    const post = await Post.findById(postId).populate({
      path: 'comments.userId',
      select: 'username profilePicture',
    });

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // push a new subdocument to the comments array
    post.comments.push({
      _id: new mongoose.Types.ObjectId(),
      userId,
      text,
      createdAt: new Date(),
    });

    await post.save();

    // Optionally populate the newly added comment
    const updatedPost = await Post.findById(postId)
      .populate({
        path: 'comments.userId',
        select: 'username profilePicture',
      })
      .populate({
        path: 'userId', // if you also want to populate the post's author
        select: 'username profilePicture',
      })
      .exec();

    res.status(200).json(
      createResponse(true, {
        post: updatedPost,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const handleGetUserPosts: RequestHandler = async (req, res, next) => {
  try {
    const { friendlyId } = req.params;
    if (!friendlyId) {
      res.status(400).json(createResponse(false, 'Friendly ID is required'));
      return;
    }
    const posts = await getAllUserPosts(friendlyId);
    res.status(200).json(createResponse(true, posts));
  } catch (error) {
    next(error);
  }
};

export const handleDeleteComment: RequestHandler = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = res.locals.userId.userId;

    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Find the comment in the array
    const commentIndex = post.comments.findIndex(
      (comment) => comment._id.toString() === commentId && comment.userId.toString() === userId,
    );

    if (commentIndex === -1) {
      throw new AppError('Comment not found or unauthorized', 403);
    }

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json(createResponse(true, { message: 'Comment deleted successfully' }));
  } catch (error) {
    next(error);
  }
};

export const handleDeletePost: RequestHandler = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = res.locals.userId.userId; // Get the logged-in user's ID

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Ensure the user deleting the post is the owner
    if (post.userId.toString() !== userId) {
      throw new AppError('Unauthorized to delete this post', 403);
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    res.status(200).json(createResponse(true, { message: 'Post deleted successfully' }));
  } catch (error) {
    next(error);
  }
};
