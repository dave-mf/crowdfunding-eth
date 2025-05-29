-- Create table for gas fee logging if it doesn't exist
CREATE TABLE IF NOT EXISTS gas_fee_logs (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL,
    donator_address VARCHAR(42) NOT NULL,
    donation_amount NUMERIC NOT NULL,
    gas_fee NUMERIC NOT NULL,
    max_fee NUMERIC NOT NULL,
    gas_price NUMERIC NOT NULL,
    gas_limit NUMERIC NOT NULL,
    contract_version VARCHAR(20) NOT NULL DEFAULT 'original',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_success BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add contract_version column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'gas_fee_logs' 
        AND column_name = 'contract_version'
    ) THEN
        ALTER TABLE gas_fee_logs ADD COLUMN contract_version VARCHAR(20) NOT NULL DEFAULT 'original';
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gas_fee_logs_campaign_id ON gas_fee_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_gas_fee_logs_donator ON gas_fee_logs(donator_address);
CREATE INDEX IF NOT EXISTS idx_gas_fee_logs_timestamp ON gas_fee_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_gas_fee_logs_contract_version ON gas_fee_logs(contract_version); 