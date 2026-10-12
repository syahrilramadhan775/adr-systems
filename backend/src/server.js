require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');

const port = Number(process.env.PORT || 4000);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL harus diset.');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  throw new Error('JWT_SECRET wajib diset dan minimal 24 karakter.');
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`ADR System API listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; shutting down API...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
