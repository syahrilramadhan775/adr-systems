require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../src/config/database');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = path.join(__dirname, '..', 'migrations');
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith('.sql')).sort();

  for (const filename of files) {
    const result = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [filename]);
    if (result.rowCount > 0) {
      console.log(`Skipping already applied migration: ${filename}`);
      continue;
    }

    const sql = await fs.readFile(path.join(dir, filename), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(filename) VALUES ($1)', [filename]);
      await client.query('COMMIT');
      console.log(`Applied migration: ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

migrate()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  });
