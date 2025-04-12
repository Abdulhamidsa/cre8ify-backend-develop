import { Types } from 'mongoose';

import { AppError } from '../../../common/errors/app.error.js';
import { PopulatedPostDocument, Post } from '../../../common/models/post.model.js';
import { User } from '../../../common/models/user.model.js';

export const getAllUserPosts = async (friendlyId: string): Promise<PopulatedPostDocument[]> => {
  try {
    const user = await User.findOne({ friendlyId }).select('_id').lean();
    if (!user) {
      throw new AppError(`User with friendlyId ${friendlyId} not found`, 404);
    }

    const posts = await Post.find({ userId: new Types.ObjectId(user._id) })
      .populate<{ userId: { _id: string; username: string; profilePicture: string } }>(
        'userId',
        '_id username profilePicture',
      )
      .populate<{ comments: { userId: { _id: string; username: string; profilePicture: string } } }>(
        'comments.userId',
        '_id username profilePicture',
      )
      .sort({ createdAt: -1 })
      .lean();

    return posts as unknown as PopulatedPostDocument[];
  } catch (error) {
    const errorMessage = (error as Error).message;
    throw new AppError(`Failed to fetch posts for friendlyId ${friendlyId}: ${errorMessage}`, 500);
  }
};
