import pg from 'pg';

const { Pool } = pg;
const env = process.env.NODE_ENV || 'development';
let connectionString: string;

switch (env) {
  case 'production':
    connectionString = process.env.PROD_DATABASE_URL!;
    break;
  case 'test':
    connectionString = process.env.TEST_DATABASE_URL!;
    break;
  default:
    connectionString = process.env.DEV_DATABASE_URL!;
    break;
}

if (!connectionString) {
  throw new Error(` DATABASE_URL is not defined for environment: ${env}`);
}

export const pool = new Pool({
  connectionString,
  ssl: env === 'production' ? { rejectUnauthorized: false } : false,
});
export default pool;
