# Pengelolaan Database

Dokumen ini berisi panduan cepat untuk mengelola data database proyek crowdfunding yang menggunakan PostgreSQL. Harap sesuaikan perintah dan langkah-langkah sesuai dengan nama tabel dan database yang Anda gunakan.

---

## 1. Melihat Data di Database

### Cara melihat semua database yang ada:

```bash
psql -l
```

### Cara melihat semua tabel dalam database `crowdfunding`:

```bash
psql -d crowdfunding -c "\\dt"
```

### Cara melihat data dari tabel spesifik (misalnya `campaigns` atau `gas_logs`):

```bash
psql -d crowdfunding -c "SELECT * FROM campaigns;" # Contoh untuk tabel campaigns
psql -d crowdfunding -c "SELECT * FROM gas_fee_logs;"   # Contoh untuk tabel gas_logs
```

---

## 2. Mereset Database atau Tabel

**PERHATIAN:** Mereset data atau database adalah operasi yang tidak dapat dibatalkan. Pastikan Anda memiliki cadangan atau sangat yakin dengan apa yang Anda lakukan.

### Cara mereset seluruh database `crowdfunding` (menghapus dan membuat ulang):

```bash
dropdb crowdfunding # Menghapus database
createdb crowdfunding # Membuat ulang database
# Anda mungkin perlu menjalankan migrasi atau skema awal setelah ini
```

### Cara mereset isi tabel spesifik (mengosongkan tabel tapi mempertahankan strukturnya):

```bash
psql -d crowdfunding -c "TRUNCATE TABLE campaigns;" # Mengosongkan tabel campaigns
psql -d crowdfunding -c "TRUNCATE TABLE gas_fee_logs;"   # Mengosongkan tabel gas_logs
```

### Cara menghapus semua data dari tabel spesifik:

```bash
psql -d crowdfunding -c "TRUNCATE TABLE campaigns;" # Contoh untuk tabel campaigns
psql -d crowdfunding -c "TRUNCATE TABLE gas_fee_logs;"   # Contoh untuk tabel gas_logs
```

### Cara menghapus data berdasarkan kriteria tertentu:

```bash
psql -d crowdfunding -c "DELETE FROM campaigns WHERE id = 123;" # Contoh: Hapus campaign dengan ID 123
psql -d crowdfunding -c "DELETE FROM gas_fee_logs WHERE timestamp < '2023-01-01';" # Contoh: Hapus log gas sebelum tanggal tertentu
```

### Menghapus seluruh database:

```bash
dropdb crowdfunding
```

---

## Catatan:

*   Ganti `campaigns` atau `gas_fee_logs` dengan nama tabel yang sebenarnya di database `crowdfunding` Anda.
*   Sesuaikan kriteria `WHERE` pada perintah `DELETE` sesuai kebutuhan Anda.
*   Selalu berhati-hati saat menjalankan perintah penghapusan data. 