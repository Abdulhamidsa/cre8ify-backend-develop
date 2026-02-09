import { getSQLClient } from '../../common/config/sql.client.js';
import { AppError } from '../../common/errors/app.error.js';
import { SQL_QUERIES } from '../../common/utils/sql.constants.js';

export const fetchCredentialsService = async (mongoRef: string): Promise<{ email: string }> => {
  const sqlClient = await getSQLClient();

  try {
    const result = await sqlClient.query(SQL_QUERIES.fetchUserCredentials, [mongoRef]);

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    return { email: result.rows[0].email };
  } catch (error) {
    throw new AppError((error as Error).message, 500);
  } finally {
    sqlClient.release();
  }
};
