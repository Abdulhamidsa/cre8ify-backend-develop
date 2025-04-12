import { AppError } from '../../../common/errors/app.error.js';
import { User } from '../../../common/models/user.model.js';
import Logger from '../../../common/utils/logger.js';

interface UserMinimalInfo {
  name: string;
  profilePicture: null | string;
  email: string;
}

export const getUserMinimalInfoService = async (mongoRef: string): Promise<UserMinimalInfo> => {
  try {
    const user = await User.findOne({ mongoRef })
      .select('username friendlyId profilePicture email -_id') // Select email
      .lean<UserMinimalInfo>();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  } catch (error) {
    Logger.error(`Error fetching minimal user info for mongoRef ${mongoRef}:`, error);
    throw new AppError('Failed to fetch user information', 500);
  }
};
