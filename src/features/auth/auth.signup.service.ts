import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { generateFriendlyId } from '../../common/utils/helper.js';
import { generateMongoRef, hashPassword } from '../../common/utils/helpers.js';
import Logger from '../../common/utils/logger.js';
import { saveDocument } from '../../common/utils/mongo.service.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';
import { SignUpInput } from '../../common/validation/user.zod.js';
import { User } from '../../models/user.model.js';

export const signUpUserService = async (data: SignUpInput): Promise<void> => {
  const {
    email,
    password,
    username,
    age = null, // Optional: Use null for `age` if not provided
    bio = '', // Default to an empty string if not provided
    profilePicture = '',
    countryOrigin = '',
    profession = '',
    coverImage = '',
  } = data;

  const sqlClient = await getSQLClient();

  try {
    await sqlClient.query(SQL_QUERIES.createUsersTable);

    // Begin transaction
    await sqlClient.query('BEGIN');

    // Check if email already exists in SQL
    const existingUserByEmail = await sqlClient.query(SQL_QUERIES.checkEmailexist, [email]);
    if (existingUserByEmail.rows.length > 0) {
      throw new AppError('Email already exists', 409, { email });
    }

    // Check if username already exists in MongoDB
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      throw new AppError('Username already exists', 409, { username });
    }

    const hashedPassword = await hashPassword(password);
    const mongoRef = generateMongoRef();
    const friendlyId = generateFriendlyId(username || '');

    // Insert user into SQL
    const sqlResult = await sqlClient.query(SQL_QUERIES.insertUser, [email, hashedPassword, mongoRef]);
    if (sqlResult.rowCount === 0) {
      throw new AppError('Failed to insert user into SQL', 500);
    }

    // Insert user into MongoDB
    const mongoUser = await saveDocument(User, {
      mongoRef,
      friendlyId,
      username,
      age,
      bio,
      profilePicture,
      coverImage,
      countryOrigin,
      profession,
    });

    if (!mongoUser) {
      throw new AppError('Failed to create user in MongoDB', 500);
    }

    await sqlClient.query('COMMIT');
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    Logger.error('Error during user signup', error);
    throw error;
  } finally {
    sqlClient.release();
  }
};
