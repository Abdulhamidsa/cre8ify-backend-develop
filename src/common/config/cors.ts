import { CorsOptions } from 'cors';

import { SECRETS } from './secrets.js';

// Combine your separate allowed origins into an array and filter out any undefined/empty values
const allowedOrigins: string[] = [SECRETS.reactAppCorsOrigin, SECRETS.nextCorsOrigin].filter(
  (origin): origin is string => !!origin,
);

export const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for ${origin}`));
    }
  },
  credentials: true, // include cookies in requests
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
