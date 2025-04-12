import { RequestHandler } from 'express';

import { AppError } from '../../common/errors/app.error.js';
import { getCookieOptions } from '../../common/utils/cookie.utils.js';
// signout handler

import { verifyToken } from '../../common/utils/jwt.js';
import { createResponse } from '../../common/utils/response.handler.js';
import { SignInInput, SignUpInput } from '../../common/validation/user.zod.js';
import { updateCredentialsService } from './auth.edit.credentials.service.js';
import { fetchCredentialsService } from './auth.fetch.credentials.service.js';
import { signInUser } from './auth.signin.service.js';
import { signUpUserService } from './auth.signup.service.js';
import { refreshTokenService } from './refresh.token.service.js';

// signup handlerclear

export const signupHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const input: SignUpInput = req.body;
    await signUpUserService(input);
    res.status(201).json(createResponse(true, { message: 'User created successfully' }));
  } catch (error) {
    next(error);
  }
};
// signin handler

export const signInHandler: RequestHandler = async (req, res, next): Promise<void> => {
  const data: SignInInput = req.body;

  try {
    const result = await signInUser(data);

    if (result.data) {
      const { accessToken, refreshToken, mongo_ref, userId } = result.data;

      const accessTokenOptions = getCookieOptions('access');
      const refreshTokenOptions = getCookieOptions('refresh');
      res.cookie('refreshToken', refreshToken, refreshTokenOptions);
      res.cookie('accessToken', accessToken, accessTokenOptions);
      if (mongo_ref) {
        req.locals = {
          user: {
            mongo_ref,
            userId,
          },
        };
      } else {
        throw new AppError('mongo_ref is missing');
      }

      res.status(200).json(createResponse(true, { message: 'Signin successful' }));
    } else {
      res.status(400).json(createResponse(false, 'Signin failed: Invalid credentials'));
    }
  } catch (error) {
    next(error);
  }
};

// Refresh token handler
export const refreshTokenHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json(createResponse(false, { message: 'Refresh token is missing' }));
      return;
    }
    const result = await refreshTokenService(refreshToken);
    res.status(200).json(createResponse(true, result));
  } catch (error) {
    next(error);
  }
};

// signout handler
export const signoutHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = res.locals.mongoRef;
    console.log('userId', userId);

    if (!userId) {
      throw new AppError('User is not logged in', 400);
    }

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(400).json(createResponse(false, { message: 'No refresh token found' }));
      return;
    }

    const decoded = await verifyToken(refreshToken, 'refresh');
    if (decoded?.mongo_ref !== userId) {
      throw new AppError('Refresh token does not match the logged-in user', 403);
    }

    res.cookie('accessToken', '', {
      ...getCookieOptions('access'),
      expires: new Date(0),
    });

    res.cookie('refreshToken', '', {
      ...getCookieOptions('refresh'),
      expires: new Date(0),
    });

    // Respond with success
    res.status(200).json(createResponse(true, { message: 'Signout successful' }));
  } catch (error) {
    next(error);
  }
};

// fetch credentials handler
export const fetchCredentialsHandler: RequestHandler = async (_req, res, next): Promise<void> => {
  try {
    const mongoRef = res.locals.mongoRef;

    if (!mongoRef) {
      throw new AppError('MongoRef is required', 400);
    }

    const credentials = await fetchCredentialsService(mongoRef);
    res.status(200).json(createResponse(true, credentials));
  } catch (error) {
    next(error);
  }
};

// edit credentials handler

export const updateCredentialsHandler: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const mongoRef = res.locals.mongoRef;
    const { email, password } = req.body;

    if (!mongoRef) {
      res.status(400).json(createResponse(false, { message: 'MongoRef is required' }));
    }

    await updateCredentialsService(mongoRef, email, password);
    res.status(200).json(createResponse(true, { message: 'Credentials updated successfully' }));
  } catch (error) {
    next(error);
  }
};
