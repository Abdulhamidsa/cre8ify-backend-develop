import pkg from 'pg';
import { PoolClient } from 'pg';

import { AppError } from '../errors/app.error.js';
import { getErrorMessage } from '../utils/error.utils.js';
import { SQL_QUERIES } from '../utils/sql.constants.js';
import { SECRETS } from './config.js';

const { Pool } = pkg;

// SSL Configuration based on environment and Railway behavior
const sslConfig =
  SECRETS.nodeEnv === 'production'
    ? { rejectUnauthorized: false } // Allow Railway's SSL cert
    : false;

// Create the pool instance
const pool = new Pool({
  connectionString: SECRETS.postgresConnectionString,
  ssl: sslConfig,
});

// Function to get a client on demand
export const getSQLClient = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    throw new AppError(getErrorMessage(error), 500);
  }
};

// Function to check and create tables if they don't exist
export const ensureTablesExist = async (): Promise<void> => {
  const sqlClient = await getSQLClient();

  const tableQueries = [SQL_QUERIES.createUsersTable];

  try {
    for (const query of tableQueries) {
      await sqlClient.query(query);
    }
  } catch (error) {
    throw new AppError(getErrorMessage(error), 500);
  } finally {
    sqlClient.release();
  }
};

// Health check function for PostgreSQL
export const checkPostgresHealth = async (): Promise<void> => {
  try {
    const client = await getSQLClient();
    await client.query('SELECT NOW()');
    client.release();
  } catch (error) {
    throw new AppError(getErrorMessage(error), 500);
  }
};

export default pool;
