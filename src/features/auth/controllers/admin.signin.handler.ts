import { NextFunction, Request, Response } from 'express';

import { createResponse } from '../../../common/utils/response.handler.js';
import { AdminSigninInput } from '../../../common/validation/admin.signin.zod.js';
import { adminSigninService } from '../auth.admin.signin.service.js';

/**
 * Handler for admin signin requests
 */
export const handleAdminSignin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password }: AdminSigninInput = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const result = await adminSigninService(email, password, ip, userAgent, res);

    if (result) {
      // Success response without sending tokens in the body (they're in the cookies)
      res.status(200).json(
        createResponse(true, {
          message: 'Admin signin successful',
          user: result.user,
        }),
      );
    } else {
      // This branch should not be reached due to error handling in the service
      res.status(401).json(createResponse(false, { message: 'Admin signin failed' }));
    }
  } catch (error) {
    next(error);
  }
};
