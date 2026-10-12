const pool = require('../../config/database');

async function summary(userId) {
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed,
       COUNT(*) FILTER (WHERE status = 'pengajuan')::INTEGER AS pengajuan,
       COUNT(*) FILTER (WHERE status = 'research')::INTEGER AS research,
       COUNT(*)::INTEGER AS total
     FROM desicion WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

module.exports = { summary };
