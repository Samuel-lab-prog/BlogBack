import { pool } from '../connection';

async function resetDb() {
  console.log(' Resetting database...');

  await pool.query(`
    TRUNCATE TABLE posts RESTART IDENTITY CASCADE;
    TRUNCATE TABLE users RESTART IDENTITY CASCADE;
    TRUNCATE TABLE tags RESTART IDENTITY CASCADE;
    TRUNCATE TABLE post_tags RESTART IDENTITY CASCADE;
  `);

  console.log('✅ Database reset!');
  process.exit(0);
}

resetDb();
