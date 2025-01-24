import { AppError } from '../../common/errors/app.error.js';
import { verifyToken } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';

export const refreshTokenService = async (refreshToken: string): Promise<void> => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  try {
    const decoded = await verifyToken(refreshToken, 'refresh');
    const mongoRef = decoded?.mongo_ref;

    if (!mongoRef) {
      throw new AppError('Invalid refresh token payload', 403);
    }

    // Check if access token is present
    if (!decoded.accessToken) {
      throw new AppError('Unauthorized', 401);
    }

    Logger.info('Access token is present');
  } catch (error) {
    Logger.info('Error verifying token:', error);
    throw new AppError('An unexpected error occurred while verifying token', 500);
  }
};
