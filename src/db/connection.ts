import pg from 'pg';
const { Pool } = pg;

const env = (process.env.NODE_ENV ?? 'development') as 'production' | 'test' | 'development';

const URLS = {
  production: process.env.PROD_DATABASE_URL,
  test: process.env.TEST_DATABASE_URL,
  development: process.env.DEV_DATABASE_URL,
};

const connectionString = URLS[env];

if (!connectionString) {
  throw new Error(`DATABASE_URL missing for NODE_ENV="${env}". Check your .env files.`);
}

export const pool = new Pool({
  connectionString,
  ...(env === 'production' ? { ssl: { rejectUnauthorized: false } } : {}),
});
