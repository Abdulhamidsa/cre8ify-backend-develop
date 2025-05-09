import mongoose from 'mongoose';

import { AppError } from '../errors/app.error.js';
import { getErrorMessage } from '../utils/error.utils.js';
import Logger from '../utils/logger.js';
import { SECRETS } from './secrets.js';

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(SECRETS.mongoConnectionString, {
      maxPoolSize: 10,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    Logger.error(`MongoDB connection failed: ${errorMessage}`);
    throw new AppError('Database connection error', 500);
  }
};
