import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { hashPassword } from '../../common/utils/helpers.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';

export const updateCredentialsService = async (
  mongoRef: string,
  email: string | null,
  password: string | null,
): Promise<void> => {
  const sqlClient = await getSQLClient();

  try {
    await sqlClient.query('BEGIN');

    // Update email if provided
    if (email) {
      await sqlClient.query(SQL_QUERIES.updateUserEmail, [email, mongoRef]);
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await hashPassword(password);
      await sqlClient.query(SQL_QUERIES.updateUserPassword, [hashedPassword, mongoRef]);
    }

    await sqlClient.query('COMMIT');
  } catch {
    await sqlClient.query('ROLLBACK');
    throw new AppError('Failed to update user credentials.', 500);
  } finally {
    sqlClient.release();
  }
};
