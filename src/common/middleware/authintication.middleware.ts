import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../../models/user.model.js';
import { SECRETS } from '../config/config.js';
import { AppError } from '../errors/app.error.js';
import { getCookieOptions } from '../utils/cookie.utils.js';
import { getErrorMessage } from '../utils/error.utils.js';
import { generateAccessToken, verifyToken } from '../utils/jwt.js';
import Logger from '../utils/logger.js';
import { createResponse } from '../utils/response.handler.js';

export const authenticateAndRefresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // Check if accessToken is present and valid
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, SECRETS.jwtSecret as string) as {
          mongo_ref: string;
          userId: string;
        };
        req.locals = {
          user: {
            mongo_ref: decoded.mongo_ref,
            userId: decoded.userId,
          },
        };
        return next();
      } catch (error) {
        if ((error as jwt.JsonWebTokenError).name !== 'TokenExpiredError') {
          throw new AppError('Invalid access token', 401);
        }
        // Token expired; proceed to validate refreshToken
      }
    }

    // If accessToken is missing or expired, verify the refreshToken
    if (!refreshToken) {
      throw new AppError('Refresh token is missing', 401);
    }

    const decodedRefresh = (await verifyToken(refreshToken, 'refresh')) as {
      mongo_ref: string;
    };
    const mongoRef = decodedRefresh.mongo_ref;

    if (!mongoRef) {
      throw new AppError('Invalid refresh token payload', 403);
    }

    // Retrieve user details from the database
    const mongoUser = await User.findOne({ mongoRef });
    if (!mongoUser) {
      throw new AppError('User not found in MongoDB', 500);
    }
    const friendlyId = mongoUser.friendlyId;
    const userId = mongoUser._id.toString();

    // Generate a new access token
    const newAccessToken = generateAccessToken({
      mongo_ref: mongoRef,
      userId,
      friendlyId,
    });
    const accessTokenOptions = getCookieOptions('access');
    res.cookie('accessToken', newAccessToken, accessTokenOptions);

    // Attach only mongo_ref and userId to req.locals
    req.locals = {
      user: {
        mongo_ref: mongoRef,
        userId,
      },
    };

    Logger.info(`New access token issued for user: ${mongoRef}`);
    next();
  } catch (error) {
    const message = getErrorMessage(error);
    Logger.error(`Error in authenticateAndRefresh middleware: ${message}`);
    res.status(error instanceof AppError ? error.status : 401).json(createResponse(false, undefined, message));
  }
};
