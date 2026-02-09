import { Request, Response, NextFunction } from 'express';

import { createResponse } from '../../../common/utils/response.handler.js';

/**
 * Debug endpoint to check authentication and user data
 * GET /debug/auth-status
 */
export const handleDebugAuthStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const debugInfo = {
      // Authentication status
      hasResLocals: !!res.locals,
      resLocalsKeys: res.locals ? Object.keys(res.locals) : [],
      
      // User ID variations
      userIdDirect: res.locals?.userId,
      userIdNested: res.locals?.userId?.userId,
      mongoRef: res.locals?.mongoRef,
      
      // Cookie information
      cookies: req.cookies,
      hasCookies: !!req.cookies,
      cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      
      // Headers
      authHeaders: {
        authorization: req.headers.authorization,
        cookie: req.headers.cookie,
      },
      
      // Full res.locals dump
      fullResLocals: res.locals,
    };

    res.status(200).json(createResponse(true, debugInfo));
  } catch (error) {
    next(error);
  }
};