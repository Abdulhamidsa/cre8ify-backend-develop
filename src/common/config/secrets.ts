import { config } from 'dotenv';

config({ path: '.env.dev' });

export const SECRETS = {
  mongoConnectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/dev_db',
  postgresConnectionString:
    process.env.POSTGRES_CONNECTION_STRING || 'postgresql://postgres:password@localhost:5432/dev_db',
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-jwt-secret',
  accessTokenExpiration: process.env.ACCESSTOKEN_EXPIRATION || '30m',
  refreshTokenExpiration: process.env.REFRESHTOKEN_EXPIRATION || '7d',
  accessTokenMaxAge: process.env.ACCESSTOKEN_MAXAGE ? parseInt(process.env.ACCESSTOKEN_MAXAGE) : 30 * 60 * 1000, // 30 minutes
  refreshTokenMaxAge: process.env.REFRESHTOKEN_MAXAGE
    ? parseInt(process.env.REFRESHTOKEN_MAXAGE)
    : 7 * 24 * 60 * 60 * 1000, // 7 days
  reactAppCorsOrigin: process.env.REACT_APP_CORS_ORIGIN || 'http://localhost:5173',
  dbPoolMin: process.env.DB_POOL_MIN ? parseInt(process.env.DB_POOL_MIN) : 1,
  dbPoolMax: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 5,
  logLevel: process.env.LOG_LEVEL || 'debug',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  projectImagesFolder: process.env.CLOUDINARY_PROJECT_IMAGES_FOLDER || 'projects/images',
  projectThumbnailsFolder: process.env.CLOUDINARY_PROJECT_THUMBNAILS_FOLDER || 'projects/thumbnails',
  imageQuality: 90,
  thumbnailQuality: 'auto',
  cookieSecure: process.env.COOKIE_SECURE === 'true', // False in development
  cookieHttpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
  cookieSameSite: process.env.COOKIE_SAME_SITE || 'lax', // Less strict in development
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 60000, // 1 minute
  rateLimitMax: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 500, // Higher limit for dev
  sentryDsn: process.env.SENTRY_DSN || '',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5173',
  frontendAppUrl: process.env.FRONTEND_APP_URL || 'http://localhost:5173',
};
