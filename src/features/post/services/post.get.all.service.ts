import { AppError } from '../../../common/errors/app.error.js';
import { PostType } from '../../../common/types/types.js';
import { Post } from '../../../models/post.model.js';

export const fetchAllPostsService = async (
  { limit = 10, page = 1 }: { limit?: number; page?: number },
  userId: string,
): Promise<{ posts: PostType[]; totalPages: number; currentPage: number }> => {
  const query: Record<string, unknown> = {};

  try {
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    if (totalPosts === 0) {
      return {
        posts: [],
        totalPages: 0,
        currentPage: 1,
      };
    }

    const options = {
      limit,
      skip: (page - 1) * limit,
    };

    const posts = await Post.find(query, null, options)
      .populate([
        { path: 'userId', select: '_id username profilePicture profession friendlyId' },
        { path: 'comments.userId', select: '_id username profilePicture' },
      ])
      .lean();

    const mappedPosts = posts.map((post) => ({
      ...post,
      id: post._id.toString(),
      likedByUser: Array.isArray(post.likes) ? post.likes.some((likeId) => likeId.toString() === userId) : false,
      likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
    })) as unknown as PostType[];

    return {
      posts: mappedPosts,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Service Error:', error);
    throw new AppError('Failed to fetch posts', 500);
  }
};
