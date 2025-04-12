import { AppError } from '../../../common/errors/app.error.js';
import { User } from '../../../common/models/user.model.js';
import Logger from '../../../common/utils/logger.js';
import { UserResponse } from '../../../common/validation/user.zod.js';

export const getUserProfileService = async (mongoRef: string): Promise<UserResponse> => {
  try {
    const user = await User.findOne({ mongoRef: mongoRef })
      .select<UserResponse>('-__v -active -deletedAt -_id -mongoRef')
      .lean<UserResponse>();

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return user;
  } catch (error) {
    Logger.error(`Error fetching user profile for mongoRef ${mongoRef}:`, error);
    throw new AppError('Failed to fetch user profile', 500);
  }
};
