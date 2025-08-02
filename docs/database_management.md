# Pengelolaan Database

Dokumen ini berisi panduan cepat untuk mengelola data database proyek crowdfunding yang menggunakan PostgreSQL. Harap sesuaikan perintah dan langkah-langkah sesuai dengan nama tabel dan database yang Anda gunakan.

---

## 1. Struktur Database

### Tabel `gas_fee_logs`
```sql
CREATE TABLE gas_fee_logs (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL,
  donator_address VARCHAR(42) NOT NULL,
  donation_amount VARCHAR(255) NOT NULL,
  gas_fee VARCHAR(255) NOT NULL,
  max_fee VARCHAR(255),
  gas_price VARCHAR(255),
  gas_limit VARCHAR(255),
  contract_version VARCHAR(50) NOT NULL,
  is_success BOOLEAN DEFAULT true,
  campaign_title VARCHAR(255),
  method_name VARCHAR(50),
  batch_id VARCHAR(255),        -- ID untuk mengelompokkan transaksi batch
  batch_index INTEGER,          -- Urutan donasi dalam batch (0, 1, 2, dst)
  batch_size INTEGER,           -- Total jumlah donasi dalam batch
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indeks yang Direkomendasikan
```sql
CREATE INDEX idx_gas_fee_logs_batch_id ON gas_fee_logs(batch_id);
CREATE INDEX idx_gas_fee_logs_campaign_id ON gas_fee_logs(campaign_id);
CREATE INDEX idx_gas_fee_logs_contract_version ON gas_fee_logs(contract_version);
CREATE INDEX idx_gas_fee_logs_timestamp ON gas_fee_logs(timestamp);
```

---

## 2. Melihat Data di Database

### Cara melihat semua database yang ada:
```bash
psql -l
```

### Cara melihat semua tabel dalam database `crowdfunding`:
```bash
psql -d crowdfunding -c "\\dt"
```

### Cara melihat data dari tabel spesifik:

#### Melihat semua transaksi:
```bash
psql -d crowdfunding -c "SELECT * FROM gas_fee_logs;"
```

#### Melihat transaksi batch:
```bash
psql -d crowdfunding -c "SELECT * FROM gas_fee_logs WHERE batch_id IS NOT NULL;"
```

#### Melihat statistik per batch:
```bash
psql -d crowdfunding -c "
  SELECT 
    batch_id,
    COUNT(*) as total_transactions,
    SUM(CAST(gas_fee AS DECIMAL)) as total_gas_fee,
    AVG(CAST(gas_fee AS DECIMAL)) as avg_gas_fee
  FROM gas_fee_logs 
  WHERE batch_id IS NOT NULL 
  GROUP BY batch_id;"
```

---

## 3. Mereset Database atau Tabel

**PERHATIAN:** Mereset data atau database adalah operasi yang tidak dapat dibatalkan. Pastikan Anda memiliki cadangan atau sangat yakin dengan apa yang Anda lakukan.

### Cara mereset seluruh database:
```bash
dropdb crowdfunding
createdb crowdfunding
```

### Cara mereset tabel spesifik:
```bash
psql -d crowdfunding -c "TRUNCATE TABLE gas_fee_logs;"
```

### Cara menghapus data berdasarkan kriteria:
```bash
# Hapus transaksi batch tertentu
psql -d crowdfunding -c "DELETE FROM gas_fee_logs WHERE batch_id = '0x123...';"

# Hapus transaksi berdasarkan waktu
psql -d crowdfunding -c "DELETE FROM gas_fee_logs WHERE timestamp < '2023-01-01';"

# Hapus transaksi berdasarkan versi kontrak
psql -d crowdfunding -c "DELETE FROM gas_fee_logs WHERE contract_version = 'batch-processing';"
```

---

## 4. Maintenance Database

### Backup Database
```bash
pg_dump crowdfunding > crowdfunding_backup.sql
```

### Restore Database
```bash
psql -d crowdfunding < crowdfunding_backup.sql
```

### Optimize Database
```bash
psql -d crowdfunding -c "VACUUM ANALYZE gas_fee_logs;"
```

---

## Catatan Penting:

1. **Batch Processing**
   - Setiap transaksi batch memiliki `batch_id` yang sama
   - `batch_index` menunjukkan urutan donasi dalam batch
   - `batch_size` menunjukkan total donasi dalam batch
   - Gas fee dihitung per batch, bukan per transaksi

2. **Gas Fee Calculation**
   - Untuk transaksi tunggal: gas fee dihitung per transaksi
   - Untuk transaksi batch: gas fee dibagi rata ke semua donasi dalam batch

3. **Best Practices**
   - Selalu backup database sebelum melakukan operasi besar
   - Gunakan indeks untuk optimasi query
   - Monitor ukuran database secara berkala
   - Lakukan VACUUM secara periodik

---

## 5. Pengelolaan Database di VPS (Linux)

**CATATAN:** Di VPS Linux, PostgreSQL menggunakan authentication method yang berbeda dengan local development. Untuk menghindari masalah authentication, gunakan user `postgres` saja.

### Setup Database di VPS

#### Install PostgreSQL:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Buat Database:
```bash
# Masuk sebagai postgres
sudo -u postgres psql

# Di dalam psql, buat database
CREATE DATABASE crowdfunding;

# Keluar dari psql
\q
```

#### Import Data dari Backup:
```bash
# Import data (dari folder backup)
sudo -u postgres psql -d crowdfunding < backup/crowdfunding_backup.sql

# Atau jika sudah di folder backup
sudo -u postgres psql -d crowdfunding < crowdfunding_backup.sql
```

### Melihat Data di VPS

#### Cek database yang ada:
```bash
sudo -u postgres psql -l
```

#### Cek tabel dalam database:
```bash
sudo -u postgres psql -d crowdfunding -c "\\dt"
```

#### Cek data transaksi:
```bash
sudo -u postgres psql -d crowdfunding -c "SELECT COUNT(*) FROM gas_fee_logs;"
sudo -u postgres psql -d crowdfunding -c "SELECT * FROM gas_fee_logs LIMIT 5;"
```

### Mereset Database di VPS

#### Reset seluruh database:
```bash
sudo -u postgres psql -c "DROP DATABASE IF EXISTS crowdfunding;"
sudo -u postgres psql -c "CREATE DATABASE crowdfunding;"
```

#### Reset tabel spesifik:
```bash
sudo -u postgres psql -d crowdfunding -c "TRUNCATE TABLE gas_fee_logs;"
```

### Backup Database di VPS

#### Backup database:
```bash
sudo -u postgres pg_dump crowdfunding > crowdfunding_backup_$(date +%Y%m%d_%H%M%S).sql
```

#### Restore database:
```bash
sudo -u postgres psql -d crowdfunding < crowdfunding_backup.sql
```

### Environment Variables di VPS

#### Update file .env:
```env
DATABASE_URL=postgresql://postgres@localhost:5432/crowdfunding
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_CHAIN_ID=11155111
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://your-vps-ip
```

### Troubleshooting di VPS

#### Jika ada error "role does not exist":
```bash
# Gunakan postgres user saja
sudo -u postgres psql -d crowdfunding
```

#### Jika ada error "database does not exist":
```bash
# Buat database dulu
sudo -u postgres psql -c "CREATE DATABASE crowdfunding;"
```

#### Test koneksi database:
```bash
sudo -u postgres psql -d crowdfunding -c "SELECT 1;"
```

### Tips VPS:

1. **Gunakan user postgres saja** untuk menghindari masalah authentication
2. **Selalu gunakan `sudo -u postgres`** sebelum perintah psql
3. **Backup secara berkala** dengan timestamp
4. **Monitor disk space** untuk database
5. **Restart aplikasi** setelah update database: `pm2 restart crowdfunding` 