import { Response } from 'express';

import { SECRETS } from '../../common/config/secrets.js';
import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { User } from '../../common/models/user.model.js';
import { setCookie } from '../../common/utils/cookie.utils.js';
import { generateAccessToken, generateRefreshToken } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';
import { formatUserForClient } from '../../common/utils/user.formatter.js';

/**
 * Admin-specific signin service that uses admin-specific cookies
 */
export const adminSigninService = async (
  email: string,
  password: string,
  ip: string,
  userAgent: string,
  res: Response,
) => {
  const sqlClient = await getSQLClient();

  try {
    // Verify credentials in SQL database
    const result = await sqlClient.query(SQL_QUERIES.verifyUserCredentials, [email, password]);

    if (result.rows.length === 0) {
      throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.active) {
      throw new AppError('Account is inactive', 403);
    }

    // Check if user has admin or super_admin role
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      Logger.warn(`Non-admin login attempt: ${email}`, {
        email,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      });
      throw new AppError('Admin privileges required', 403);
    }

    // Get user details from MongoDB
    const mongoUser = await User.findOne({ mongoRef: user.mongo_ref }).select(
      'username email friendlyId profilePicture bio active',
    );

    if (!mongoUser) {
      throw new AppError('User profile not found', 404);
    }

    // Log successful admin login
    Logger.info(`Admin login: ${email}`, {
      userId: mongoUser._id,
      username: mongoUser.username,
      email,
      role: user.role,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      mongo_ref: user.mongo_ref,
      userId: mongoUser._id.toString(),
      friendlyId: mongoUser.friendlyId,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      mongo_ref: user.mongo_ref,
      userId: mongoUser._id.toString(),
      friendlyId: mongoUser.friendlyId,
      role: user.role,
    });

    // Set admin-specific cookies with different names
    setCookie(res, 'admin_accessToken', accessToken, {
      maxAge: SECRETS.accessTokenMaxAge,
      httpOnly: true,
      secure: SECRETS.cookieSecure,
      sameSite: SECRETS.cookieSameSite as 'strict' | 'lax' | 'none' | undefined,
    });

    setCookie(res, 'admin_refreshToken', refreshToken, {
      maxAge: SECRETS.refreshTokenMaxAge,
      httpOnly: true,
      secure: SECRETS.cookieSecure,
      sameSite: SECRETS.cookieSameSite as 'strict' | 'lax' | 'none' | undefined,
    });

    return {
      user: {
        ...formatUserForClient(mongoUser),
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } finally {
    sqlClient.release();
  }
};
