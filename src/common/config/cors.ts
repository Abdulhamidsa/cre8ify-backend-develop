import { SECRETS } from './secrets.js';

const allowedOrigins = [SECRETS.reactAppCorsOrigin, SECRETS.nextCorsOrigin].filter((origin) => !!origin); // This filters out any undefined or empty values

export const corsOptions = {
  origin: (origin: string, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for ${origin}`), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
