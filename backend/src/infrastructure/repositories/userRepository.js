const pool = require('../../config/database');
const { withTransaction } = require('./transaction');

const SELECT_USERS = `
  SELECT u.id, u.name, u.email, u.position,
         u.created_at AS "createdAt", u.updated_at AS "updatedAt",
         d.id AS "departmentId", d.name AS department
  FROM users u
  LEFT JOIN departments d ON d.user_id = u.id`;

async function findAuthByEmail(email) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, position FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  return result.rows[0] || null;
}

async function findAuthById(id) {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, position FROM users WHERE id = $1`, [id]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(`${SELECT_USERS} WHERE u.id = $1`, [id]);
  return result.rows[0] || null;
}

async function list() {
  const result = await pool.query(`${SELECT_USERS} ORDER BY u.id ASC`);
  return result.rows;
}

async function create(data) {
  return withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO users(name, email, password_hash, position)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [data.name, data.email, data.passwordHash, data.position]
    );
    const id = inserted.rows[0].id;
    await client.query('INSERT INTO departments(name, user_id) VALUES ($1, $2)', [data.department, id]);
    const result = await client.query(`${SELECT_USERS} WHERE u.id = $1`, [id]);
    return result.rows[0];
  });
}

async function update(id, data) {
  return withTransaction(async (client) => {
    const fields = [];
    const values = [];
    const pushField = (column, value) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };
    if (data.name !== undefined) pushField('name', data.name);
    if (data.email !== undefined) pushField('email', data.email);
    if (data.passwordHash !== undefined) pushField('password_hash', data.passwordHash);
    if (data.position !== undefined) pushField('position', data.position);

    if (fields.length) {
      values.push(id);
      await client.query(
        `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
        values
      );
    }

    if (data.department !== undefined) {
      await client.query(
        `INSERT INTO departments(name, user_id) VALUES ($1, $2)
         ON CONFLICT(user_id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
        [data.department, id]
      );
    }
    const result = await client.query(`${SELECT_USERS} WHERE u.id = $1`, [id]);
    return result.rows[0] || null;
  });
}

async function remove(id) {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = { findAuthByEmail, findAuthById, findById, list, create, update, remove };
