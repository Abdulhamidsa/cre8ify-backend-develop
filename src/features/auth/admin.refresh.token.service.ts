import { Response } from 'express';

import { SECRETS } from '../../common/config/secrets.js';
import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { User } from '../../common/models/user.model.js';
import { setCookie } from '../../common/utils/cookie.utils.js';
import { generateAccessToken, verifyToken } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';

/**
 * Service to refresh admin access token using admin refresh token
 */
export const adminRefreshTokenService = async (refreshToken: string, res: Response) => {
  try {
    const decoded = await verifyToken(refreshToken, 'refresh');

    if (!decoded || !decoded.mongo_ref) {
      throw new AppError('Invalid refresh token', 401);
    }

    const sqlClient = await getSQLClient();

    try {
      // Get user details from SQL
      const result = await sqlClient.query(SQL_QUERIES.getUserByMongoRef, [decoded.mongo_ref]);

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.active) {
        throw new AppError('Account is inactive', 403);
      }

      // Check if user has admin or super_admin role
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        Logger.warn(`Non-admin refresh token attempt for user: ${user.email}`, {
          mongo_ref: decoded.mongo_ref,
          timestamp: new Date().toISOString(),
        });
        throw new AppError('Admin privileges required', 403);
      }

      // Get MongoDB user data
      const mongoUser = await User.findOne({ mongoRef: decoded.mongo_ref }).select('_id friendlyId');

      if (!mongoUser) {
        throw new AppError('User profile not found', 404);
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        mongo_ref: decoded.mongo_ref,
        userId: mongoUser._id.toString(),
        friendlyId: mongoUser.friendlyId,
        role: user.role,
      });

      // Set new admin access token cookie
      setCookie(res, 'admin_accessToken', newAccessToken, {
        maxAge: SECRETS.accessTokenMaxAge,
        httpOnly: true,
        secure: SECRETS.cookieSecure,
        sameSite: SECRETS.cookieSameSite as 'strict' | 'lax' | 'none' | undefined,
      });

      Logger.info(`Admin token refreshed for: ${user.email}`, {
        userId: mongoUser._id,
        role: user.role,
        timestamp: new Date().toISOString(),
      });

      return {
        userId: mongoUser._id,
        role: user.role,
      };
    } finally {
      sqlClient.release();
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired, please log in again', 401);
    }
    throw error;
  }
};
