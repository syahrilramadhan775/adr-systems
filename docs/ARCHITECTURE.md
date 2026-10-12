# Architecture & Data Model

## Layered backend

- **Routes** memetakan HTTP method dan URL REST ke controller.
- **Controllers** mengatur HTTP status dan response envelope, bukan business logic.
- **Middlewares** memverifikasi JWT dan memvalidasi request memakai Joi.
- **Application services** menerapkan aturan bisnis, misalnya status awal, validasi owner, dan password hashing.
- **Repositories** menjalankan SQL PostgreSQL dengan parameter binding dan transaksi.
- **Domain/shared** berisi status/whitelist domain, `AppError`, response helper, dan mapping HTTP error.

## Tables

### `users`

`id INTEGER PK`, `name VARCHAR`, `position VARCHAR CHECK lead|senior|staff`, plus `email` dan `password_hash` untuk autentikasi. `position` di-index. `email` unik.

### `departments`

`id INTEGER PK`, `name VARCHAR CHECK backend|frontend|unity|sqa|ld`, `user_id INTEGER FK UNIQUE -> users.id`. Unique foreign key memastikan tiap user memiliki maksimal satu row department. CRUD department dilakukan lewat user.

### `desicion`

Nama tabel mengikuti spelling `desicion` yang diminta. Berisi `id`, `cve` (di-index), field ADR (`title`, `context`, `decision`, `consequences`, `alternatives`), `status`, `user_id` sebagai owner, `status_updated_by_user_id` sebagai user yang terakhir mengubah status, serta timestamp. `status` disimpan sebagai string dengan CHECK `pengajuan|research|completed`; `user_id` dan kolom status updater berelasi ke `users`.

### `history`

`id INTEGER PK`, `description TEXT`, `desicion_id INTEGER FK UNIQUE -> desicion.id`. Unique foreign key menjamin satu catatan history untuk satu ADR. PostgreSQL menggunakan `TEXT` sebagai padanan long text.

## Business rules

1. Pembuatan ADR mengisi status `pengajuan` di backend, mengabaikan status client karena schema create tidak menerima field status.
2. Perubahan status dilakukan melalui `PATCH /v1/decisions/:id/status`. Payload hanya menerima `research` atau `completed`.
3. Server membaca `sub` dari JWT sebagai user ID. Service memeriksa `desicion.user_id` sebelum update konten, update status, maupun delete; kepemilikan tidak diambil dari body request.
4. `status_updated_by_user_id` selalu di-set pada saat pembuatan dan diperbarui bersama status di dalam transaksi.
5. Pembuatan ADR dan history dijalankan dalam satu transaksi; update konten dan catatan history juga satu transaksi.
6. Setiap input yang melewati API divalidasi Joi; foreign key dan enum whitelist kembali diproteksi di level database.
7. `lead` saja yang dapat membuat, mengubah, atau menghapus user. `position` bukan nama role bebas, dan divalidasi pada Joi serta constraint PostgreSQL.

## Migration & seed

Migration SQL berada di `backend/migrations/`. Runner menyimpan file yang sudah dieksekusi ke `schema_migrations` dan tidak mengeksekusi ulang migration yang sudah tercatat. Seeder membuat lima user dummy, lima department dan lima ADR beserta history; aman dijalankan ulang untuk data seed berdasarkan email user dan pasangan owner/kode ADR.
