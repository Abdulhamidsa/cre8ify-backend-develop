import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { User } from '../../common/models/user.model.js';
import { generateFriendlyId } from '../../common/utils/helper.js';
import { generateMongoRef, hashPassword } from '../../common/utils/helpers.js';
import Logger from '../../common/utils/logger.js';
import { saveDocument } from '../../common/utils/mongo.service.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';
import { SignUpInput } from '../../common/validation/user.zod.js';

export const signUpUserService = async (data: SignUpInput): Promise<void> => {
  const {
    email,
    password,
    username,
    age = null,
    bio = '',
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
    const friendlyId = generateFriendlyId(username || email);

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
      await sqlClient.query('ROLLBACK');
      throw new AppError('Failed to create user in MongoDB', 500);
    }

    await sqlClient.query('COMMIT');
  } catch (error) {
    // Rollback in case of any error
    await sqlClient.query('ROLLBACK');
    Logger.error('Error during user signup', error);
    throw error;
  } finally {
    sqlClient.release();
  }
};
