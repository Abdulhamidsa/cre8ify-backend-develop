import { NextFunction, Request, Response } from 'express';

import { getCookieOptions } from '../../../common/utils/cookie.utils.js';
import Logger from '../../../common/utils/logger.js';
import { createResponse } from '../../../common/utils/response.handler.js';

/**
 * Handler for admin signout
 * Clears admin-specific cookies
 */
export const handleAdminSignout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Log the admin signout
    if (res.locals?.userId) {
      Logger.info(`Admin signout: ${res.locals.userId}`, {
        userId: res.locals.userId,
        role: res.locals.role,
        timestamp: new Date().toISOString(),
      });
    }

    // Clear admin access token cookie
    res.cookie('admin_accessToken', '', {
      ...getCookieOptions('access'),
      expires: new Date(0),
    });

    // Clear admin refresh token cookie
    res.cookie('admin_refreshToken', '', {
      ...getCookieOptions('refresh'),
      expires: new Date(0),
    });

    // Send success response
    res.status(200).json(createResponse(true, { message: 'Admin signed out successfully' }));
  } catch (error) {
    next(error);
  }
};
