import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

import { AppError } from '../errors/app.error.js';

export const ValidZod = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  if (!schema || typeof schema.parse !== 'function') {
    throw new AppError('ValidZod middleware requires a valid Zod schema', 500);
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req[source]);
      req[source] = validatedData; // Overwrite with validated data
      next(); // Proceed to the next middleware
    } catch (error) {
      if (error instanceof ZodError) {
        // Aggregate Zod validation errors into a single string
        const errorMessage = error.errors.map((err) => `${err.path.join('.')} - ${err.message}`).join('; ');

        // Pass an AppError to the next middleware
        next(new AppError(`Validation failed: ${errorMessage}`, 400));
        return;
      }

      // Pass unexpected errors to the next middleware
      next(error);
    }
  };
};
