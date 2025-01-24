import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { UserResponse } from '../../../common/validation/user.zod.js';
import { User } from '../../../models/user.model.js';

export const getUserProfileService = async (mongoRef: string): Promise<UserResponse> => {
  try {
    // Fetch the user profile based on mongoRef
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
