import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { SECRETS } from '../config/secrets.js';
import { getSQLClient } from '../config/sql.client.js';
import { AppError } from '../errors/app.error.js';
import { User } from '../models/user.model.js';
import { getCookieOptions } from '../utils/cookie.utils.js';
import { getErrorMessage } from '../utils/error.utils.js';
import { generateAccessToken, verifyToken } from '../utils/jwt.js';
import Logger from '../utils/logger.js';
import { createResponse } from '../utils/response.handler.js';

/**
 * Specialized authentication middleware for admin routes
 * This handles admin authentication AND authorization in one step
 * Uses admin-specific cookies that are separate from regular user cookies
 */
export const requireSuperAdminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Use regular user cookies - admin logs in with same system as users
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    let mongoRef = '';
    let userId = '';

    // Try to get mongoRef from access token first
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, SECRETS.jwtSecret as string) as {
          mongo_ref: string;
          userId: string;
        };
        mongoRef = decoded.mongo_ref;
        userId = decoded.userId;
      } catch (error) {
        if ((error as jwt.JsonWebTokenError).name !== 'TokenExpiredError') {
          throw new AppError('Invalid admin access token', 401);
        }
        // Token expired; proceed to validate refreshToken
      }
    }

    // If access token failed or expired, try refresh token
    if (!mongoRef && refreshToken) {
      const decodedRefresh = (await verifyToken(refreshToken, 'refresh')) as {
        mongo_ref: string;
      };
      mongoRef = decodedRefresh.mongo_ref;

      if (!mongoRef) {
        throw new AppError('Invalid admin refresh token payload', 403);
      }

      // Get user details from MongoDB
      const mongoUser = await User.findOne({ mongoRef });
      if (!mongoUser) {
        throw new AppError('User not found in MongoDB', 500);
      }

      const friendlyId = mongoUser.friendlyId;
      userId = mongoUser._id.toString();

      // Generate a new access token
      const newAccessToken = generateAccessToken({
        mongo_ref: mongoRef,
        userId,
        friendlyId,
      });
      const accessTokenOptions = getCookieOptions('access');
      // Use regular cookie name
      res.cookie('accessToken', newAccessToken, accessTokenOptions);

      Logger.info(`New admin access token issued for admin: ${mongoRef}`);
    }

    // If no authentication found
    if (!mongoRef) {
      throw new AppError('Authentication required - please sign in', 401);
    }

    // Now check if this user is an admin (either 'admin' or 'super_admin')
    const sqlClient = await getSQLClient();

    try {
      // Check for both admin and super_admin roles
      const adminCheck = await sqlClient.query(
        'SELECT role FROM users WHERE mongo_ref = $1 AND (role = $2 OR role = $3) AND active = true',
        [mongoRef, 'admin', 'super_admin'],
      );

      if (adminCheck.rows.length === 0) {
        Logger.warn(`Unauthorized admin access attempt by user: ${mongoRef}`, {
          mongoRef,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString(),
        });
        throw new AppError('Admin access required. This incident has been logged.', 403);
      }

      const userRole = adminCheck.rows[0].role;
      Logger.info(`Admin access granted to user: ${mongoRef} with role: ${userRole}`, {
        mongoRef,
        role: userRole,
        action: 'admin_access_granted',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
      });

      // Set locals for handlers to use
      res.locals.mongoRef = mongoRef;
      res.locals.userId = userId;

      next();
    } finally {
      sqlClient.release();
    }
  } catch (error) {
    const message = getErrorMessage(error);
    Logger.error(`Error in super admin auth middleware: ${message}`, {
      error: message,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(error instanceof AppError ? error.status : 500).json(createResponse(false, undefined, message));
  }
};
