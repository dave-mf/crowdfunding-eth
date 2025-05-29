import { pool } from '../../config/database';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        campaignId,
        donatorAddress,
        donationAmount,
        gasFee,
        maxFee,
        gasPrice,
        gasLimit,
        contractVersion,
        isSuccess,
        campaignTitle,
        methodName
      } = req.body;

      const query = `
        INSERT INTO gas_fee_logs (
          campaign_id,
          donator_address,
          donation_amount,
          gas_fee,
          max_fee,
          gas_price,
          gas_limit,
          contract_version,
          is_success,
          campaign_title,
          method_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;

      const values = [
        campaignId,
        donatorAddress,
        donationAmount,
        gasFee,
        maxFee,
        gasPrice,
        gasLimit,
        contractVersion || 'original',
        isSuccess,
        campaignTitle || '',
        methodName || ''
      ];

      const result = await pool.query(query, values);
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error logging gas fee:', error);
      res.status(500).json({ error: error.message || 'Failed to log gas fee' });
    }
  } else if (req.method === 'GET') {
    try {
      const { campaignId, timeRange, contractVersion, page = 1, limit = 10 } = req.query;
      
      let query = `
        SELECT 
          g.*,
          COUNT(*) OVER() as total_count,
          AVG(gas_fee) OVER() as avg_gas_fee,
          SUM(gas_fee) OVER() as total_gas_fee,
          campaign_title,
          method_name
        FROM gas_fee_logs g
        WHERE 1=1
      `;
      
      const values = [];
      let paramCount = 1;

      if (campaignId && campaignId !== 'all') {
        query += ` AND campaign_id = $${paramCount}`;
        values.push(campaignId);
        paramCount++;
      }

      if (contractVersion && contractVersion !== 'all') {
        query += ` AND contract_version = $${paramCount}`;
        values.push(contractVersion);
        paramCount++;
      }

      if (timeRange && timeRange !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
          case '24h':
            startDate = new Date(now - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query += ` AND timestamp >= $${paramCount}`;
        values.push(startDate);
        paramCount++;
      }

      // Add pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);
      
      // If this is a campaign-specific request (for PopUp), return just the transactions
      if (campaignId && campaignId !== 'all') {
        res.status(200).json({
          transactions: result.rows
        });
        return;
      }
      
      // For gas stats page, group data by contract version
      const groupedData = {
        original: [],
        optimized: [],
        variablePacking: [],
        batchProcessing: []
      };

      result.rows.forEach(record => {
        const version = record.contract_version || 'original';
        groupedData[version].push(record);
      });

      res.status(200).json({
        transactions: result.rows,
        stats: groupedData,
        total_count: result.rows[0]?.total_count || 0
      });
    } catch (error) {
      console.error('Error fetching gas fee data:', error);
      res.status(500).json({ error: 'Failed to fetch gas fee data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 