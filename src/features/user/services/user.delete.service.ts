import { getSQLClient } from '../../../common/config/sql-client.js';
import { AppError } from '../../../common/errors/app.error.js';
import Logger from '../../../common/utils/logger.js';
import { SQL_QUERIES } from '../../../common/utils/sql.constants.js';
import { User } from '../../../models/user.model.js';

export const deleteUserService = async (mongoRef: string): Promise<void> => {
  const sqlClient = await getSQLClient();

  try {
    // Begin SQL transaction
    await sqlClient.query('BEGIN');
    // 1. Delete user from MySQL
    const sqlResult = await sqlClient.query(SQL_QUERIES.deleteUser, [mongoRef]);
    if (sqlResult.rowCount === 0) {
      throw new AppError('User not found in MySQL', 404);
    }

    // 2. Mark user as inactive in MongoDB
    const deletedUser = await User.findOneAndUpdate(
      { mongo_ref: mongoRef },
      { $set: { active: false, deletedAt: new Date() } },
      { new: true },
    );

    if (!deletedUser) {
      throw new AppError('User not found in MongoDB', 404);
    }

    // Commit SQL transaction
    await sqlClient.query('COMMIT');

    Logger.info(`User with mongo_ref ${mongoRef} successfully deleted from MySQL and marked as inactive in MongoDB`);
  } catch (error) {
    // Rollback SQL transaction if anything goes wrong
    await sqlClient.query('ROLLBACK');
    Logger.error(`Error deleting user with mongo_ref ${mongoRef}:`, error);

    throw error;
  } finally {
    sqlClient.release();
  }
};
