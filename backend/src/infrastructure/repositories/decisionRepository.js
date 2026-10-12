const pool = require('../../config/database');
const { withTransaction } = require('./transaction');

const SELECT_DECISIONS = `
  SELECT d.id, d.cve, d.title, d.context, d.decision, d.consequences, d.alternatives, d.status,
         d.user_id AS "userId", d.status_updated_by_user_id AS "statusUpdatedByUserId",
         d.created_at AS "createdAt", d.updated_at AS "updatedAt",
         h.description AS "historyDescription",
         owner.name AS "ownerName", updater.name AS "statusUpdatedByName"
  FROM desicion d
  LEFT JOIN history h ON h.desicion_id = d.id
  JOIN users owner ON owner.id = d.user_id
  LEFT JOIN users updater ON updater.id = d.status_updated_by_user_id`;

async function listByOwner(userId) {
  const result = await pool.query(`${SELECT_DECISIONS} WHERE d.user_id = $1 ORDER BY d.updated_at DESC, d.id DESC`, [userId]);
  return result.rows;
}

async function findById(id) {
  const result = await pool.query(`${SELECT_DECISIONS} WHERE d.id = $1`, [id]);
  return result.rows[0] || null;
}

async function findOwnerId(id) {
  const result = await pool.query('SELECT user_id AS "userId" FROM desicion WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function create(userId, data) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO desicion(cve, title, context, decision, consequences, alternatives, status, user_id, status_updated_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'pengajuan', $7, $7) RETURNING id`,
      [data.cve, data.title, data.context, data.decision, data.consequences, data.alternatives, userId]
    );
    const id = inserted.rows[0].id;
    await client.query('INSERT INTO history(description, desicion_id) VALUES ($1, $2)', [data.historyDescription, id]);
    const result = await client.query(`${SELECT_DECISIONS} WHERE d.id = $1`, [id]);
    return result.rows[0];
  });
}

async function updateOwned(id, userId, data) {
  return withTransaction(async (client) => {
    const map = {
      cve: 'cve', title: 'title', context: 'context', decision: 'decision',
      consequences: 'consequences', alternatives: 'alternatives'
    };
    const assignments = [];
    const values = [];
    for (const [key, column] of Object.entries(map)) {
      if (data[key] !== undefined) {
        values.push(data[key]);
        assignments.push(`${column} = $${values.length}`);
      }
    }
    if (assignments.length > 0) {
      values.push(id, userId);
      await client.query(
        `UPDATE desicion SET ${assignments.join(', ')}, updated_at = NOW()
         WHERE id = $${values.length - 1} AND user_id = $${values.length}`,
        values
      );
    }

    if (data.historyDescription !== undefined) {
      await client.query(
        'UPDATE history SET description = $1, updated_at = NOW() WHERE desicion_id = $2',
        [data.historyDescription, id]
      );
    }
    const result = await client.query(`${SELECT_DECISIONS} WHERE d.id = $1 AND d.user_id = $2`, [id, userId]);
    return result.rows[0] || null;
  });
}

async function updateStatusOwned(id, userId, status) {
  return withTransaction(async (client) => {
    await client.query(
      `UPDATE desicion SET status = $1, status_updated_by_user_id = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $2`,
      [status, userId, id]
    );
    const result = await client.query(`${SELECT_DECISIONS} WHERE d.id = $1 AND d.user_id = $2`, [id, userId]);
    return result.rows[0] || null;
  });
}

async function removeOwned(id, userId) {
  const result = await pool.query('DELETE FROM desicion WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
  return result.rowCount > 0;
}

module.exports = { listByOwner, findById, findOwnerId, create, updateOwned, updateStatusOwned, removeOwned };
