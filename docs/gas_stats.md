# Gas Fee Statistics Documentation

## Overview
The Gas Fee Statistics feature provides detailed insights into gas consumption across different contract versions in the crowdfunding platform. It helps users understand and compare gas efficiency between different contract implementations.

## Features

### 1. Statistics Cards
- **Original Contract**: Baseline gas consumption metrics
- **Optimized Contract**: Gas metrics for the optimized version
- **Variable Packing**: Gas metrics for the variable packing implementation
- **Batch Processing**: Gas metrics for the batch processing implementation

Each card displays:
- Total Transactions
- Average Gas Fee (ETH)
- Total Gas Fee (ETH)
- Total Gas Fee (USD)
- Savings percentage (compared to original)

### 2. Transaction History Table
- Campaign details
- Method used (Single/Batch Donation)
- Contract Version
- Gas Fee (ETH and USD)
- Transaction Status
- Timestamp

### 3. Filtering Options
- Campaign selection
- Contract version selection
- Time range selection (24h, 7d, 30d, all time)

## Data Structure

### API Response Format
```javascript
{
  transactions: [
    {
      campaign_id: number,
      campaign_title: string,
      donator_address: string,
      donation_amount: string,
      gas_fee: string,
      contract_version: string,
      method_name: string,
      is_success: boolean,
      timestamp: string,
      batch_id: string,        // ID untuk mengelompokkan transaksi batch
      batch_index: number,     // Urutan donasi dalam batch
      batch_size: number       // Total donasi dalam batch
    }
  ],
  stats: {
    original: [{
      avg_gas_fee: string,
      total_gas_fee: string,
      transaction_count: string
    }],
    optimized: [...],
    variablePacking: [...],
    batchProcessing: [...]
  },
  total_count: number
}
```

### Database Schema
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
  batch_index INTEGER,          -- Urutan donasi dalam batch
  batch_size INTEGER,           -- Total donasi dalam batch
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### 1. Data Collection
- Gas fees are logged during transaction execution
- Data is collected from transaction receipts
- ETH to USD conversion is performed using current market rates
- For batch transactions:
  - Same `batch_id` for all donations in a batch
  - `batch_index` tracks donation order
  - `batch_size` stores total donations
  - Gas fee is calculated per batch, not per transaction

### 2. Data Processing
- Statistics are calculated per contract version
- For batch transactions:
  - Gas fee is divided equally among all donations
  - Transaction count reflects actual number of donations
  - Total gas fee represents actual gas cost per batch
- Aggregations include:
  - Average gas fee
  - Total gas fee
  - Transaction count
- Savings are calculated as percentage difference from original contract

### 3. Frontend Components
- `GasStats.js`: Main component for statistics display
- `GasFeeService.js`: Service for API communication
- Card components for each contract version
- Transaction history table with pagination

## API Endpoints

### GET /api/gas-fee
Query Parameters:
- `campaignId`: Filter by campaign ID
- `timeRange`: Filter by time range (24h, 7d, 30d, all)
- `contractVersion`: Filter by contract version
- `page`: Page number for pagination
- `limit`: Items per page

### POST /api/gas-fee
Request Body:
```javascript
{
  campaignId: number,
  donatorAddress: string,
  donationAmount: string,
  gasFee: string,
  maxFee: string,
  gasPrice: string,
  gasLimit: string,
  contractVersion: string,
  isSuccess: boolean,
  campaignTitle: string,
  methodName: string,
  batchId: string,           // ID untuk mengelompokkan transaksi batch
  batchIndex: number,        // Urutan donasi dalam batch
  batchSize: number          // Total donasi dalam batch
}
```

## Usage Examples

### Fetching Statistics
```javascript
const stats = await GasFeeService.getGasFeeStats({
  campaignId: 'all',
  timeRange: '7d',
  contractVersion: 'all',
  page: 1,
  limit: 10
});
```

### Logging Transaction
```javascript
await logTransaction(
  transaction.hash,
  campaignId,
  amount,
  methodName,
  batchId,     // ID batch jika transaksi batch
  batchIndex,  // Urutan dalam batch
  batchSize    // Total donasi dalam batch
);
```

## Best Practices

1. **Data Collection**
   - Always log gas fees immediately after transaction confirmation
   - Include both ETH and USD values
   - Validate transaction success before logging
   - For batch transactions:
     - Use same batch_id for all donations in a batch
     - Calculate gas fee per batch, not per donation
     - Store batch metadata (index, size)

2. **Data Display**
   - Format numbers appropriately (6 decimals for ETH, 2 for USD)
   - Show loading states during data fetch
   - Handle errors gracefully
   - For batch transactions:
     - Display batch information clearly
     - Show total gas fee per batch
     - Indicate number of donations in batch

3. **Performance**
   - Use pagination for large datasets
   - Cache ETH price updates
   - Optimize database queries with proper indexing
   - For batch transactions:
     - Group by batch_id for efficient querying
     - Use batch metadata for accurate statistics

## Troubleshooting

Common issues and solutions:

1. **Missing Statistics**
   - Check if transactions are being logged correctly
   - Verify contract version mapping
   - Ensure database queries are working
   - For batch transactions:
     - Verify batch_id is consistent
     - Check batch metadata is complete
     - Ensure gas fee is calculated per batch

2. **Incorrect Calculations**
   - Verify gas fee format in database
   - Check ETH price conversion
   - Validate aggregation queries
   - For batch transactions:
     - Confirm gas fee division is correct
     - Verify batch size matches actual donations
     - Check batch grouping in queries

3. **Display Issues**
   - Check data structure matches expected format
   - Verify null/undefined handling
   - Ensure proper number formatting
   - For batch transactions:
     - Validate batch information display
     - Check batch grouping in UI
     - Verify batch statistics calculation 