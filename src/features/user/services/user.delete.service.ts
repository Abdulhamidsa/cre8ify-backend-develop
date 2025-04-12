import { getSQLClient } from '../../../common/config/sql.client.js';
import { AppError } from '../../../common/errors/app.error.js';
import { User } from '../../../common/models/user.model.js';
import Logger from '../../../common/utils/logger.js';
import { SQL_QUERIES } from '../../../common/utils/sql.constants.js';

export const deactivateUserService = async (mongoRef: string): Promise<void> => {
  const sqlClient = await getSQLClient();

  try {
    await sqlClient.query('BEGIN');

    const sqlResult = await sqlClient.query(SQL_QUERIES.deactivateUser, [mongoRef]);

    if (sqlResult.rowCount === 0) {
      Logger.warn(`User with mongo_ref ${mongoRef} is already deactivated or does not exist in MySQL.`);
      return;
    }

    const existingUser = await User.findOne({ mongoRef });
    if (!existingUser) {
      throw new AppError('User not found in MongoDB', 404);
    }

    if (existingUser.active === false) {
      Logger.warn(`User with mongo_ref ${mongoRef} is already deactivated in MongoDB.`);
      return;
    }

    await User.findOneAndUpdate({ mongoRef }, { $set: { active: false, deletedAt: new Date() } }, { new: true });

    await sqlClient.query('COMMIT');
    Logger.info(`User with mongo_ref ${mongoRef} successfully deactivated in MySQL and MongoDB`);
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    Logger.error(`Error deactivating user with mongo_ref ${mongoRef}:`, error);
    throw error;
  } finally {
    sqlClient.release();
  }
};
