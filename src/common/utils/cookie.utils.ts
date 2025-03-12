import { CookieOptions } from 'express';

import { SECRETS } from '../config/secrets.js';

export const getCookieOptions = (tokenType: 'access' | 'refresh'): CookieOptions => {
  const isProd = SECRETS.nodeEnv === 'production';

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  cookieOptions.maxAge = tokenType === 'access' ? SECRETS.accessTokenMaxAge : SECRETS.refreshTokenMaxAge;

  return cookieOptions;
};
