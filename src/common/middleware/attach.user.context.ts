import { NextFunction, Request, Response } from 'express';

import { AppError } from '../errors/app.error.js';

export const attachUserContext = (req: Request, res: Response, next: NextFunction): void => {
  const mongoRef = req.locals?.user?.mongo_ref;
  const userId = req.locals?.user;
  if (!mongoRef || !userId) {
    return next(new AppError('User is not authenticated', 401));
  }
  res.locals.mongoRef = mongoRef;
  res.locals.userId = userId;

  next();
};
