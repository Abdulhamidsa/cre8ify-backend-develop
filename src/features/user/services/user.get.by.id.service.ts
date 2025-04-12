import { AppError } from '../../../common/errors/app.error.js';
import { User } from '../../../common/models/user.model.js';
import Logger from '../../../common/utils/logger.js';
import { UserResponse } from '../../../common/validation/user.zod.js';

export const getPublicUserProfileService = async (friendlyId: string): Promise<Partial<UserResponse>> => {
  try {
    const user = await User.findOne({ friendlyId }).select('-__v -mongoRef -deletedAt -active').lean();

    if (!user) {
      throw new AppError(`User with friendlyId "${friendlyId}" not found.`, 404);
    }
    return { ...user, _id: user._id.toString() };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    Logger.error(`Unexpected error fetching public profile for friendlyId "${friendlyId}":`, error);

    throw new AppError('An unexpected error occurred while fetching the public profile.', 500);
  }
};
