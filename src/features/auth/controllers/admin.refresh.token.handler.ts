import { NextFunction, Request, Response } from 'express';

import { AppError } from '../../../common/errors/app.error.js';
import { createResponse } from '../../../common/utils/response.handler.js';
import { adminRefreshTokenService } from '../admin.refresh.token.service.js';

/**
 * Handler for admin refresh token requests
 */
export const handleAdminRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies?.admin_refreshToken;

    if (!refreshToken) {
      throw new AppError('Admin refresh token is missing', 401);
    }

    const result = await adminRefreshTokenService(refreshToken, res);

    res.status(200).json(
      createResponse(true, {
        message: 'Admin token refreshed successfully',
        user: {
          userId: result.userId,
          role: result.role,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};
