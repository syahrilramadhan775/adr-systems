# ADR-SYSTEM REST API

Base URL lokal: `http://localhost:4000/v1`. Semua endpoint selain `POST /auth/login` dan `GET /health` membutuhkan header `Authorization: Bearer <JWT>`. Endpoint yang sama juga dapat dipanggil melalui frontend proxy: `http://localhost:2000/api/v1/...`.

Request/response menggunakan JSON. Response sukses umumnya berbentuk `{ "data": ... }`. Response error berbentuk `{ "error": { "code": "...", "message": "...", "details": [] } }`.

## Auth

| Method | Endpoint | Tujuan | Success |
|---|---|---|---|
| `POST` | `/auth/login` | Login dengan email dan password, mengembalikan JWT + user | `200 OK` |
| `GET` | `/auth/me` | Profil user dari token | `200 OK` |

Login request:

```json
{ "email": "lead@adr.local", "password": "Password123!" }
```

## Dashboard

| Method | Endpoint | Tujuan | Success |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Hitung jumlah ADR milik user aktif per status | `200 OK` |

Contoh response `data`:

```json
{ "completed": 1, "pengajuan": 1, "research": 1, "total": 3 }
```

## Decisions / ADR

List, detail, dan dashboard hanya menampilkan ADR milik user yang sedang login.

| Method | Endpoint | Tujuan | Success |
|---|---|---|---|
| `GET` | `/decisions` | List ADR milik user aktif | `200 OK` |
| `POST` | `/decisions` | Buat ADR baru; status selalu `pengajuan` | `201 Created` |
| `GET` | `/decisions/:id` | Detail ADR milik user aktif | `200 OK` |
| `PATCH` | `/decisions/:id` | Patch field ADR dan/atau catatan history | `200 OK` |
| `PATCH` | `/decisions/:id/status` | Ubah hanya status menjadi `research` atau `completed` | `200 OK` |
| `DELETE` | `/decisions/:id` | Hapus ADR milik user aktif | `204 No Content` |

Contoh create request (semua field wajib kecuali status yang diatur server):

```json
{
  "cve": "ADR-2026-010",
  "title": "Gunakan Redis untuk caching",
  "context": "Endpoint dashboard perlu membaca ringkasan secara cepat.",
  "decision": "Gunakan Redis untuk menyimpan cache ringkasan dengan TTL.",
  "consequences": "Respons lebih cepat, tetapi invalidasi cache perlu dirancang.",
  "alternatives": "Query PostgreSQL langsung atau menggunakan cache in-memory.",
  "historyDescription": "ADR diajukan untuk ditinjau oleh tim backend."
}
```

Contoh update satu kolom status:

```http
PATCH /v1/decisions/10/status
Authorization: Bearer <JWT>
Content-Type: application/json
```

```json
{ "status": "research" }
```

Nilai `pengajuan` tidak diterima pada endpoint update status. Status baru hanya `research` atau `completed`. Field status tidak diterima pada `POST /decisions` atau `PATCH /decisions/:id`; gunakan endpoint status di atas. Mengubah atau menghapus ADR user lain menghasilkan `403 Forbidden`.

## Users

Semua endpoint user butuh JWT. Semua user dapat melihat directory; `POST`, `PATCH`, dan `DELETE` hanya untuk position `lead`.

| Method | Endpoint | Tujuan | Success |
|---|---|---|---|
| `GET` | `/users` | List user beserta department | `200 OK` |
| `POST` | `/users` | Membuat user dan department 1:1 | `201 Created` |
| `GET` | `/users/:id` | Detail user | `200 OK` |
| `PATCH` | `/users/:id` | Mengubah sebagian field user | `200 OK` |
| `DELETE` | `/users/:id` | Menghapus user jika tidak direferensikan ADR | `204 No Content` |

Contoh create:

```json
{
  "name": "Fajar Developer",
  "email": "fajar@adr.local",
  "password": "ChangeMe123!",
  "position": "staff",
  "department": "backend"
}
```

Allowed `position`: `lead`, `senior`, `staff`. Allowed `department`: `backend`, `frontend`, `unity`, `sqa`, `ld`. Password minimal 10 karakter dan di-hash sebelum disimpan.

## Departments

| Method | Endpoint | Tujuan | Success |
|---|---|---|---|
| `GET` | `/departments` | List row department beserta pemilik user | `200 OK` |

Department dikelola lewat CRUD user agar aturan relasi satu-ke-satu tetap dipatuhi.

## HTTP status codes

| Code | Arti dan kapan digunakan |
|---|---|
| `200 OK` | GET atau PATCH berhasil. |
| `201 Created` | Resource baru berhasil dibuat. |
| `204 No Content` | DELETE berhasil; tidak ada response body. |
| `400 Bad Request` | JSON request rusak/tidak dapat diparse. |
| `401 Unauthorized` | Token hilang/kedaluwarsa/tidak valid atau kredensial login salah. |
| `403 Forbidden` | User tidak memiliki posisi `lead` untuk administrasi user atau bukan pemilik ADR. |
| `404 Not Found` | Resource/endpoint tidak ditemukan atau record yang diminta tidak ada. |
| `409 Conflict` | Email duplikat atau penghapusan bertentangan dengan foreign key. |
| `422 Unprocessable Content` | Request dapat diparse tetapi gagal validasi Joi atau constraint data. |
| `500 Internal Server Error` | Kegagalan server yang tidak terduga. Detail internal tidak dikirim ke client. |
| `502 Bad Gateway` | Frontend proxy tidak dapat terhubung ke backend. |

Validation error `422` menyertakan `error.details`, berisi `field` dan `message` untuk tiap field yang gagal.
