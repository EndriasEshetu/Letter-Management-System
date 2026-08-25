import { Pool, types } from 'pg';
import { config } from '../config';

// pg returns int8 (bigint/bigserial) columns as strings by default. Parse them
// as numbers so ids, file_size, etc. match the frontend's numeric JSON contract.
types.setTypeParser(20, (value: string) => parseInt(value, 10));

/**
 * PostgreSQL connection pool.
 * SSL is enabled when DB_SSL=true (required for Railway and most managed databases).
 */
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.dbSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client:', err.message);
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

export default pool;
