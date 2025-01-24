import { PoolClient } from 'pg';

/**
 * Handles a database operation within a transaction.
 *
 * @param client - The PostgreSQL client.
 * @param operation - A callback function containing the database logic to execute within the transaction.
 */
export const withTransaction = async (client: PoolClient, operation: () => Promise<void>): Promise<void> => {
  try {
    await client.query('BEGIN'); // Start transaction
    await operation(); // Execute operation
    await client.query('COMMIT'); // Commit transaction
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback transaction on error
    throw error; // Rethrow the error to be handled by the calling function
  }
};
