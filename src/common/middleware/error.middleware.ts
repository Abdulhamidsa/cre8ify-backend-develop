import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app.error.js';
import { getErrorMessage } from '../utils/error.utils.js';
import Logger from '../utils/logger.js';

const expressErrorMiddleware: ErrorRequestHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  const isDev = process.env.NODE_ENV !== 'production';
  const statusCode = err instanceof AppError ? err.status : 500;
  const message = getErrorMessage(err);

  Logger.error(message);

  if (isDev && err.stack) {
    Logger.debug(`Stack Trace:\n${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: err instanceof AppError ? err.details : undefined,
  });
};

export default expressErrorMiddleware;
