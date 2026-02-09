import { AppError } from '../../../common/errors/app.error.js';
import { Post } from '../../../common/models/post.model.js';
import { PostType } from '../../../common/types/types.js';

export const fetchAllPostsService = async (
  { limit = 10, page = 1 }: { limit?: number; page?: number },
  userId: string | null,
): Promise<{ posts: PostType[]; totalPages: number; currentPage: number }> => {
  const query: Record<string, unknown> = {};

  try {
    // Ensure `createdAt` is indexed for faster sorting
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    if (totalPosts === 0) {
      return {
        posts: [],
        totalPages: 0,
        currentPage: 1,
      };
    }

    // Optimized query
    const posts = await Post.find(query)
      .select('_id content image createdAt updatedAt userId likes comments') // ✅ Use `.select()` instead of projection
      .sort({ createdAt: -1 }) // ✅ Sorting is optimized with index
      .limit(limit)
      .skip((page - 1) * limit)
      .populate([
        { path: 'userId', select: '_id username profilePicture profession friendlyId' },
        { path: 'comments.userId', select: '_id username profilePicture' },
      ])
      .lean();

    const mappedPosts = posts.map((post) => {
      const isLikedByUser = userId && Array.isArray(post.likes) ? 
        post.likes.some((likeId) => likeId.toString() === userId) : false;
      
      // Debug logging for first post
      if (posts.indexOf(post) === 0) {
        console.log('Like Calculation Debug for first post:', {
          postId: post._id.toString(),
          userId,
          hasUserId: !!userId,
          likesArray: post.likes,
          likesArrayLength: post.likes.length,
          likedByUser: isLikedByUser,
          likeComparison: post.likes.map(likeId => ({
            likeId: likeId.toString(),
            matchesUser: likeId.toString() === userId,
          }))
        });
      }
      
      return {
        ...post,
        id: post._id.toString(),
        likedByUser: isLikedByUser,
        likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
      };
    }) as PostType[];

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
