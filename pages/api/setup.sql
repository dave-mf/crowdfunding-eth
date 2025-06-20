-- Drop existing table if exists
DROP TABLE IF EXISTS gas_fee_logs CASCADE;

-- Create new table with updated structure
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
  batch_id VARCHAR(255),
  batch_index INTEGER,
  batch_size INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_gas_fee_logs_batch_id ON gas_fee_logs(batch_id);
CREATE INDEX idx_gas_fee_logs_campaign_id ON gas_fee_logs(campaign_id);
CREATE INDEX idx_gas_fee_logs_contract_version ON gas_fee_logs(contract_version);
CREATE INDEX idx_gas_fee_logs_timestamp ON gas_fee_logs(timestamp);

-- Add comments
COMMENT ON COLUMN gas_fee_logs.batch_id IS 'ID untuk mengelompokkan transaksi batch (biasanya transaction hash)';
COMMENT ON COLUMN gas_fee_logs.batch_index IS 'Urutan donasi dalam batch (0, 1, 2, dst)';
COMMENT ON COLUMN gas_fee_logs.batch_size IS 'Total jumlah donasi dalam batch'; 