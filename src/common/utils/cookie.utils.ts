import { CookieOptions, Response } from 'express';

import { SECRETS } from '../config/secrets.js';

export const getCookieOptions = (tokenType: 'access' | 'refresh'): CookieOptions => {
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  cookieOptions.maxAge = tokenType === 'access' ? SECRETS.accessTokenMaxAge : SECRETS.refreshTokenMaxAge;

  return cookieOptions;
};

// New utility functions for managing cookies with custom names
export const setCookie = (res: Response, name: string, value: string, options: CookieOptions): void => {
  res.cookie(name, value, options);
};

export const clearCookie = (res: Response, name: string): void => {
  res.cookie(name, '', {
    expires: new Date(0),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
};
