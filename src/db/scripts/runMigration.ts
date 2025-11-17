import fs from 'fs';
import path from 'path';
import { pool } from '../connection';

async function runMigrations() {
  const migrationsPath = path.join(__dirname, '..', 'migrations');
  const files = fs
    .readdirSync(migrationsPath)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);

  for (const file of files) {
    const already = await pool.query(`SELECT 1 FROM migrations WHERE name = $1`, [file]);

    if (already.rowCount) {
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf-8');
    console.log(` Migration running for file: ${file}`);

    await pool.query(sql);
    await pool.query(`INSERT INTO migrations (name) VALUES ($1)`, [file]);
  }

  console.log('✅ All migrations applied!');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('❌ Error in migrations:', err);
  process.exit(1);
});
