import { NextFunction, Request, Response } from 'express';

import { AppError } from '../../common/errors/app.error.js';
import { verifyToken } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';

/**
 * Middleware to verify admin authentication tokens
 * Uses admin-specific cookies that are separate from regular user cookies
 */
export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminAccessToken = req.cookies?.admin_accessToken;

    if (!adminAccessToken) {
      throw new AppError('Admin access token missing', 401);
    }

    try {
      const decoded = await verifyToken(adminAccessToken, 'access');

      // Check if token has admin role
      if (!decoded || !decoded.role || (decoded.role !== 'admin' && decoded.role !== 'super_admin')) {
        throw new AppError('Insufficient admin privileges', 403);
      }

      // Store admin information in res.locals for use in route handlers
      res.locals = {
        ...res.locals,
        mongoRef: decoded.mongo_ref,
        userId: decoded.userId,
        friendlyId: decoded.friendlyId,
        role: decoded.role,
        isAdmin: true,
      };

      Logger.debug('Admin authenticated', {
        userId: decoded.userId,
        role: decoded.role,
        endpoint: req.originalUrl,
        method: req.method,
      });

      next();
    } catch (error) {
      // Handle expired tokens
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new AppError('Admin session expired', 401);
      }

      // Handle invalid tokens
      throw new AppError('Invalid admin token', 401);
    }
  } catch (error) {
    next(error);
  }
};
