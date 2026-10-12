const pool = require('../../config/database');

async function list() {
  const result = await pool.query(
    `SELECT d.id, d.name, d.user_id AS "userId", u.name AS "userName",
            d.created_at AS "createdAt", d.updated_at AS "updatedAt"
     FROM departments d JOIN users u ON u.id = d.user_id ORDER BY d.name, d.id`
  );
  return result.rows;
}

module.exports = { list };
