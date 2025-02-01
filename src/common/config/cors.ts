import { SECRETS } from './secrets.js';

export const corsOptions = {
  origin: SECRETS.reactAppCorsOrigin,
  credentials: true, //  include cookies in  requests
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization'],
  // methods: 'GET, PUT, POST, DELETE',
  // preflightContinue: false,
  // maxAge: 86400, // max age of 1 day for caching preflight requests in browser to reduce server load
};
