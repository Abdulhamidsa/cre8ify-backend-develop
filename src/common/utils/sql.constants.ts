export const SQL_QUERIES = {
  checkEmailexist: 'SELECT id FROM users WHERE email = $1;',
  fetchUserCredentials: `
    SELECT email FROM users WHERE mongo_ref = $1;
  `,
  updateUserEmail: `UPDATE users SET email = $1 WHERE mongo_ref = $2;`,
  updateUserPassword: `UPDATE users SET password_hash = $1 WHERE mongo_ref = $2;`,
  insertUser: `
    INSERT INTO users (email, password_hash, mongo_ref, role)
    VALUES ($1, $2, $3, 'user') RETURNING id;
  `,
  rollbackUser: 'DELETE FROM users WHERE id = $1;',
  getUserLogin: 'SELECT password_hash, mongo_ref FROM users WHERE email = $1;',
  deleteUser: 'DELETE FROM users WHERE mongo_ref = $1;',

  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(250) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      mongo_ref VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'user' NOT NULL
    );
  `,
};
