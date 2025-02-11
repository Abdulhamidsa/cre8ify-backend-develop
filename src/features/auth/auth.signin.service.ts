import bcrypt from 'bcrypt';

import { ensureTablesExist, getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { SignInResponse } from '../../common/types/user.types.js';
import { getErrorMessage } from '../../common/utils/error.utils.js';
import { generateTokens } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';
import { ApiResponse, createResponse } from '../../common/utils/response.handler.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';
import { withTransaction } from '../../common/utils/transaction.helper.js';
import { SignInInput } from '../../common/validation/user.zod.js';
import { User } from '../../models/user.model.js';

export const signInUser = async (data: SignInInput): Promise<ApiResponse<SignInResponse>> => {
  const { email, password } = data;
  const sqlClient = await getSQLClient();

  try {
    let mongoRef = '';
    let friendlyId = '';
    let userId: string = '';

    // Ensure the necessary tables exist
    await ensureTablesExist();

    // Log the sign-in attempt
    Logger.info(`Sign-in attempt for email: ${email}`);

    // Use the transaction utility for SQL operations
    await withTransaction(sqlClient, async () => {
      const result = await sqlClient.query(SQL_QUERIES.getUserLogin, [email]);
      const user = result.rows[0];
      if (!user) {
        throw new AppError('Invalid email or password', 400);
      }

      const { password_hash, mongo_ref } = user;
      mongoRef = mongo_ref;

      // Validate the password
      const isPasswordValid = await bcrypt.compare(password, password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 400);
      }
    });

    // Now after validating SQL, we interact with MongoDB
    const mongoUser = await User.findOne({ mongoRef });

    // If the MongoDB user doesn't exist, throw an error
    if (!mongoUser) {
      throw new AppError('MongoDB user not found', 500);
    }

    // If the MongoDB user exists, update the necessary details if needed
    friendlyId = mongoUser.friendlyId;
    userId = mongoUser._id.toString();

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(mongoRef, friendlyId, userId);

    return createResponse(true, { mongo_ref: mongoRef, friendlyId, userId, accessToken, refreshToken });
  } catch (error) {
    Logger.error(`Error during user sign-in: ${getErrorMessage(error)}`);
    throw error;
  } finally {
    sqlClient.release();
  }
};
