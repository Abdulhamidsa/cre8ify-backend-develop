import bcrypt from 'bcryptjs';

import { ensureTablesExist, getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { User } from '../../common/models/user.model.js';
import { SignInResponse } from '../../common/types/user.types.js';
import { getErrorMessage } from '../../common/utils/error.utils.js';
import { generateTokens } from '../../common/utils/jwt.js';
import Logger from '../../common/utils/logger.js';
import { ApiResponse, createResponse } from '../../common/utils/response.handler.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';
import { withTransaction } from '../../common/utils/transaction.helper.js';
import { SignInInput } from '../../common/validation/user.zod.js';

export const signInUser = async (data: SignInInput): Promise<ApiResponse<SignInResponse>> => {
  const { email, password } = data;
  const sqlClient = await getSQLClient();

  try {
    let mongoRef = '';
    let friendlyId = '';
    let userId: string = '';

    await ensureTablesExist();

    Logger.info(`Sign-in attempt for email: ${email}`);

    await withTransaction(sqlClient, async () => {
      const result = await sqlClient.query(SQL_QUERIES.getUserLogin, [email]);
      const user = result.rows[0];
      if (!user) {
        throw new AppError('Invalid email or password', 400);
      }

      const { password_hash, mongo_ref } = user;
      mongoRef = mongo_ref;

      const isPasswordValid = await bcrypt.compare(password, password_hash);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 400);
      }
    });

    const mongoUser = await User.findOne({ mongoRef });

    if (!mongoUser) {
      throw new AppError('MongoDB user not found', 500);
    }

    if (mongoUser.active === false) {
      throw new AppError('Account is deactivated. Please contact support to reactivate your account.', 403);
    }

    if (!mongoUser) {
      throw new AppError('MongoDB user not found', 500);
    }

    friendlyId = mongoUser.friendlyId;
    userId = mongoUser._id.toString();

    const { accessToken, refreshToken } = await generateTokens(mongoRef, friendlyId, userId);

    return createResponse(true, { mongo_ref: mongoRef, friendlyId, userId, accessToken, refreshToken });
  } catch (error) {
    Logger.error(`Error during user sign-in: ${getErrorMessage(error)}`);
    throw error;
  } finally {
    sqlClient.release();
  }
};
