import fs from 'fs';
import path from 'path';
import { pool } from '../connection';

async function runSeeds() {
  const dir = path.join(__dirname, '..', 'seeds');
  const files = fs.readdirSync(dir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running seed for file: ${file}`);
    await pool.query(sql);
  }

  console.log('✅ Seeds applied');
  process.exit(0);
}

runSeeds();
