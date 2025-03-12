import { CorsOptions } from 'cors';

import { SECRETS } from './secrets.js';

const allowedOrigins: string[] = [SECRETS.reactAppCorsOrigin, SECRETS.nextCorsOrigin].filter(
  (origin): origin is string => !!origin,
);

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Set-Cookie', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['Set-Cookie'],
};
