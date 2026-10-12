require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');

const PASSWORD = 'Password123!';
const users = [
  { name: 'Ari Lead', email: 'lead@gmail.com', position: 'lead', department: 'backend' },
  { name: 'Bima Senior', email: 'senior@gmail.com', position: 'senior', department: 'frontend' },
  { name: 'Citra Staff', email: 'staff@gmail.com', position: 'staff', department: 'unity' },
  { name: 'Dewi QA', email: 'sqa@gmail.com', position: 'staff', department: 'sqa' },
  { name: 'Eka Learning', email: 'ld@gmail.com', position: 'senior', department: 'ld' }
];

const decisions = [
  {
    owner: 'lead@gmail.com', cve: 'ADR-2026-001', title: 'Gunakan PostgreSQL sebagai database utama',
    context: 'Sistem membutuhkan penyimpanan relasional dengan constraint dan transaksi yang kuat.',
    decision: 'Menggunakan PostgreSQL sebagai database utama aplikasi ADR.',
    consequences: 'Relasi dan integritas data dikelola oleh database; tim perlu mengelola migration.',
    alternatives: 'MySQL atau penyimpanan dokumen.', history: 'ADR dibuat untuk menetapkan database utama. Menunggu pengajuan review.', status: 'pengajuan'
  },
  {
    owner: 'lead@gmail.com', cve: 'ADR-2026-002', title: 'Gunakan JWT untuk autentikasi API',
    context: 'Frontend perlu mengakses REST API dan kepemilikan ADR harus diverifikasi.',
    decision: 'Gunakan access token JWT dengan masa berlaku terbatas.',
    consequences: 'API dapat memverifikasi identitas tanpa session server; secret wajib dijaga.',
    alternatives: 'Server-side session atau opaque token.', history: 'Implementasi JWT sedang diteliti oleh tim.', status: 'research'
  },
  {
    owner: 'lead@gmail.com', cve: 'ADR-2026-003', title: 'Gunakan layered architecture di backend',
    context: 'Logic domain harus dipisahkan dari detail HTTP dan database.',
    decision: 'Pisahkan routes, controllers, application services, repositories, dan domain.',
    consequences: 'Kode lebih mudah diuji dan dirawat, tetapi membutuhkan struktur file yang konsisten.',
    alternatives: 'MVC monolitik tanpa service/repository layer.', history: 'Keputusan arsitektur sudah diterapkan pada scaffold awal.', status: 'completed'
  },
  {
    owner: 'senior@gmail.com', cve: 'ADR-2026-004', title: 'Gunakan Next.js untuk web client',
    context: 'Aplikasi membutuhkan halaman dashboard dan pengelolaan ADR.',
    decision: 'Menggunakan Next.js dengan JavaScript untuk frontend.',
    consequences: 'Routing dan build terintegrasi; tim mengikuti struktur App Router.',
    alternatives: 'React + Vite.', history: 'ADR pengajuan dari tim frontend.', status: 'pengajuan'
  },
  {
    owner: 'staff@gmail.com', cve: 'ADR-2026-005', title: 'Validasi request dengan Joi',
    context: 'Payload dari pengguna perlu divalidasi secara konsisten sebelum masuk ke service.',
    decision: 'Gunakan Joi sebagai lapisan validasi request di Express.',
    consequences: 'Bentuk payload terstandar dan error validasi konsisten.',
    alternatives: 'Zod atau express-validator.', history: 'Pola validasi sudah ditinjau dan diterapkan.', status: 'research'
  }
];

async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const userIds = new Map();

  for (const user of users) {
    const result = await pool.query(
      `INSERT INTO users(name, email, password_hash, position)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT(email) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position, updated_at = NOW()
       RETURNING id, email`,
      [user.name, user.email, passwordHash, user.position]
    );
    const id = result.rows[0].id;
    userIds.set(user.email, id);
    await pool.query(
      `INSERT INTO departments(name, user_id) VALUES ($1, $2)
       ON CONFLICT(user_id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
      [user.department, id]
    );
  }

  for (const adr of decisions) {
    const userId = userIds.get(adr.owner);
    const existing = await pool.query('SELECT id FROM desicion WHERE cve = $1 AND user_id = $2 ORDER BY id LIMIT 1', [adr.cve, userId]);
    let decisionId;
    if (existing.rowCount) {
      decisionId = existing.rows[0].id;
      await pool.query(
        `UPDATE desicion SET title=$1, context=$2, decision=$3, consequences=$4, alternatives=$5,
          status=$6, status_updated_by_user_id=$7, updated_at=NOW() WHERE id=$8`,
        [adr.title, adr.context, adr.decision, adr.consequences, adr.alternatives, adr.status, userId, decisionId]
      );
    } else {
      const inserted = await pool.query(
        `INSERT INTO desicion(cve, title, context, decision, consequences, alternatives, status, user_id, status_updated_by_user_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8) RETURNING id`,
        [adr.cve, adr.title, adr.context, adr.decision, adr.consequences, adr.alternatives, adr.status, userId]
      );
      decisionId = inserted.rows[0].id;
    }
    await pool.query(
      `INSERT INTO history(description, desicion_id) VALUES ($1, $2)
       ON CONFLICT(desicion_id) DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()`,
      [adr.history, decisionId]
    );
  }

  console.log(`Seed completed: ${users.length} users and ${decisions.length} ADR records.`);
  console.log(`Demo password for all seeded users: ${PASSWORD}`);
}

seed()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await pool.end();
    process.exit(1);
  });
