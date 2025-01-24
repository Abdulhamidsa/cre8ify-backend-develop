import jwt, { JsonWebTokenError, JwtPayload } from 'jsonwebtoken';

import { SECRETS } from '../config/config.js';
import { AppError } from '../errors/app.error.js';
import { SignInResponse } from '../types/user.types.js';
import { getErrorMessage } from './error.utils.js';

interface UserPayload {
  mongo_ref: string;
  userId: string;
  friendlyId: string;
}

const createToken = (payload: UserPayload, secret: string, expiresIn: string): string => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateAccessToken = (payload: UserPayload): string => {
  const { mongo_ref, userId, friendlyId } = payload;
  if (!mongo_ref || !userId || !friendlyId) {
    throw new AppError('Invalid payload for access token generation', 400);
  }
  return createToken(payload, SECRETS.jwtSecret || '', SECRETS.accessTokenExpiration || '10m');
};

export const generateRefreshToken = (payload: UserPayload): string => {
  const { mongo_ref, userId, friendlyId } = payload;
  if (!mongo_ref || !userId || !friendlyId) {
    throw new AppError('Invalid payload for refresh token generation', 400);
  }
  return createToken(payload, SECRETS.jwtRefreshSecret || '', SECRETS.refreshTokenExpiration || '1d');
};

const getTokenSecret = (tokenType: 'access' | 'refresh'): string => {
  return tokenType === 'access' ? SECRETS.jwtSecret || '' : SECRETS.jwtRefreshSecret || '';
};

const validateToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw handleTokenError(error);
  }
};

const handleTokenError = (error: unknown): AppError => {
  const message = getErrorMessage(error);
  const errorName = (error as JsonWebTokenError)?.name;

  const errorMessages: Record<string, string> = {
    JsonWebTokenError: 'Token is invalid',
    TokenExpiredError: 'Token has expired',
  };

  const responseMessage = errorMessages[errorName] || 'Token verification failed';
  const statusCode = errorName === 'TokenExpiredError' ? 401 : 403;

  return new AppError(responseMessage || message, statusCode);
};

export const verifyToken = async (token: string, tokenType: 'access' | 'refresh'): Promise<JwtPayload> => {
  if (!token) {
    throw new AppError('Token is required', 401);
  }

  const secret = getTokenSecret(tokenType);
  return validateToken(token, secret);
};

export const generateTokens = async (
  mongo_ref: string,
  friendlyId: string,
  userId: string,
): Promise<SignInResponse> => {
  if (!mongo_ref || !friendlyId || !userId) {
    throw new AppError('Invalid input for token generation', 500);
  }

  const accessToken = generateAccessToken({ mongo_ref, friendlyId, userId });
  const refreshToken = generateRefreshToken({ mongo_ref, friendlyId, userId });

  return { accessToken, refreshToken, mongo_ref, friendlyId, userId };
};
