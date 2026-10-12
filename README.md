# ADR-SYSTEM

Aplikasi untuk mengelola **Architecture Decision Record (ADR)**, dengan backend REST API Express.js + PostgreSQL dan frontend Next.js (JavaScript). Seluruh endpoint API menggunakan prefix `/v1`.

## Jalankan dengan Docker Compose

Prasyarat: Docker Engine dan Docker Compose v2.

```bash
# opsional: gunakan secret JWT khusus untuk environment ini
cp .env.example .env
# edit JWT_SECRET di .env sebelum deployment non-lokal

docker compose up --build -d
```

Akses aplikasi:

- Web client: <http://localhost:2000>
- Backend health: <http://localhost:4000/v1/health>
- PostgreSQL: `localhost:5432`

Compose project name ditetapkan sebagai `adr-system` (nama project Docker Compose disimpan dalam bentuk lowercase).

### Database sesuai konfigurasi yang diminta

| Parameter | Nilai |
|---|---|
| Database | `adr-system` |
| Username | `postgres` |
| Password | `toor` |
| Port | `5432` |

Backend memakai connection string internal Docker `postgresql://postgres:toor@db:5432/adr-system`. Saat backend mulai, ia menjalankan migration lalu seeder sebelum menerima request.

> `postgres/toor` dan akun dummy adalah konfigurasi demonstrasi lokal sesuai permintaan. Jangan gunakan password default ini di lingkungan production. Ganti `JWT_SECRET`, password database, dan password akun seed sebelum deployment sungguhan.

## Akun dummy

Semua akun seed menggunakan password `Password123!`.

| Email | Position | Department |
|---|---|---|
| `lead@adr.local` | `lead` | `backend` |
| `senior@adr.local` | `senior` | `frontend` |
| `staff@adr.local` | `staff` | `unity` |
| `sqa@adr.local` | `staff` | `sqa` |
| `ld@adr.local` | `senior` | `ld` |

Akun `lead` memiliki hak membuat, mengubah, dan menghapus user. Semua user yang login dapat membaca directory user. ADR dan dashboard dibatasi ke data yang dibuat oleh user yang sedang login.

## Arsitektur repository

```text
backend/
  migrations/                  # SQL migration versioned
  scripts/                      # runner migration dan seeder
  src/
    config/                     # konfigurasi PostgreSQL
    domain/                     # konstanta domain dan AppError
    application/
      services/                 # business rules/use cases
      validators/               # skema Joi
    infrastructure/repositories/ # query PostgreSQL dan transaksi
    controllers/                # HTTP request/response
    routes/                     # REST endpoint /v1
    middlewares/                # JWT auth, validation
    shared/                     # status HTTP, response, error handler
  tests/
frontend/
  app/                          # Next.js App Router pages
  app/api/v1/[...path]/          # server-side proxy ke backend internal
  lib/                          # helper API dan session frontend
  Dockerfile
  next.config.js
docs/
  API.md                        # endpoint, method, request, response, status code
  ARCHITECTURE.md               # keputusan skema dan aturan bisnis
docker-compose.yml
```

## Aturan inti

- Status ADR: `pengajuan`, `research`, `completed`. Saat ADR baru dibuat, backend **selalu** mengatur `pengajuan`; client tidak dapat menentukan status awal.
- Endpoint khusus status adalah `PATCH /v1/decisions/:id/status`; payload hanya menerima `research` atau `completed`.
- JWT menentukan identitas user. Update konten, perubahan status, dan penghapusan ADR hanya diizinkan jika `desicion.user_id` sama dengan ID user pada token.
- `status_updated_by_user_id` menyimpan user ID yang terakhir memperbarui status. Pada pembuatan ADR, kolom ini dimulai dengan ID pembuat.
- Tabel `history` satu-ke-satu dengan `desicion` sesuai spesifikasi, sehingga menyimpan satu narasi/catatan per ADR, bukan event log dengan banyak baris.
- PostgreSQL tidak memiliki tipe `LONGTEXT` terpisah; `TEXT` dipakai untuk kolom `history.description` dan field naratif ADR.
- Kolom inti `users` yang diminta (`id`, `name`, `position`) dipertahankan. `email` dan `password_hash` ditambahkan agar login serta validasi kepemilikan bisa dilakukan dengan identitas yang terautentikasi. ADR juga memiliki `title`, `context`, `decision`, `consequences`, dan `alternatives` agar record arsitektur jelas.

## Perintah operasional

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
# menjalankan migration/seeder secara manual di container backend
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed
# berhenti tanpa menghapus data database
docker compose down
# HATI-HATI: menghapus volume PostgreSQL dan seluruh data
# docker compose down -v
```

Untuk menjalankan backend atau frontend tanpa Docker, lihat `.env.example` di direktori masing-masing. Backend lokal membutuhkan PostgreSQL dengan database dan kredensial yang sama. Frontend menerima `API_URL=http://localhost:4000` dan `PORT=2000`.

## Dokumentasi tambahan

- [API reference](docs/API.md)
- [Architecture & data model](docs/ARCHITECTURE.md)
