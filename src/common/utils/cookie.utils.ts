import { CookieOptions } from 'express';

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
