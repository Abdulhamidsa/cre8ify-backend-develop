import 'express';

declare global {
  namespace Express {
    interface Request {
      locals?: {
        user?: {
          mongo_ref: string;
          userId: string;
        };
      };
    }
    interface Response {
      locals: {
        mongoRef?: string;
        userId?: string;
      };
    }
  }
}

export {};
