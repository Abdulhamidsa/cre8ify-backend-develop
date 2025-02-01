import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { UserResponse } from '../../../common/validation/user.zod.js';
import { User } from '../../../models/user.model.js';

export const getPublicUserProfileService = async (friendlyId: string): Promise<Partial<UserResponse>> => {
  try {
    const user = await User.findOne({ friendlyId }).select('username profilePicture bio createdAt').lean();

    if (!user) {
      throw new AppError('Public profile not found', 404);
    }

    return {
      username: user.username,
      profilePicture: user.profilePicture || '',
      bio: user.bio || '',
      createdAt: user.createdAt,
    };
  } catch (error) {
    Logger.error(`Error fetching public user profile for friendlyId ${friendlyId}:`, error);
    throw new AppError('Failed to fetch public profile', 500);
  }
};
