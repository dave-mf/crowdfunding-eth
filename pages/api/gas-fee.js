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
      
      console.log("API Request params:", { campaignId, timeRange, contractVersion, page, limit });

      let query = `
        WITH stats AS (
          SELECT 
            CASE 
              WHEN contract_version = 'batch-processing' THEN 'batchProcessing'
              WHEN contract_version = 'variable-packing' THEN 'variablePacking'
              ELSE contract_version
            END as normalized_version,
            COUNT(*) as transaction_count,
            ROUND(AVG(CAST(gas_fee AS NUMERIC)), 18) as avg_gas_fee,
            ROUND(SUM(CAST(gas_fee AS NUMERIC)), 18) as total_gas_fee
          FROM gas_fee_logs
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

      query += `
          GROUP BY normalized_version
        )
        SELECT 
          g.*,
          COUNT(*) OVER() as total_count,
          s.transaction_count,
          s.avg_gas_fee,
          s.total_gas_fee,
          s.normalized_version
        FROM gas_fee_logs g
        LEFT JOIN stats s ON 
          CASE 
            WHEN g.contract_version = 'batch-processing' THEN 'batchProcessing'
            WHEN g.contract_version = 'variable-packing' THEN 'variablePacking'
            ELSE g.contract_version
          END = s.normalized_version
        WHERE 1=1
      `;

      // Add the same WHERE conditions for the main query
      if (campaignId && campaignId !== 'all') {
        query += ` AND g.campaign_id = $${paramCount}`;
        values.push(campaignId);
        paramCount++;
      }

      if (contractVersion && contractVersion !== 'all') {
        query += ` AND g.contract_version = $${paramCount}`;
        values.push(contractVersion);
        paramCount++;
      }

      if (timeRange && timeRange !== 'all') {
        query += ` AND g.timestamp >= $${paramCount}`;
        values.push(startDate);
        paramCount++;
      }

      // Add pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` ORDER BY g.timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      values.push(parseInt(limit), offset);

      const result = await pool.query(query, values);
      console.log("Query result:", result.rows);
      
      // If this is a campaign-specific request (for PopUp), return just the transactions
      if (campaignId && campaignId !== 'all') {
        console.log("Returning campaign-specific transactions");
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

      // Create a map to store unique stats per version
      const versionStats = {};

      result.rows.forEach(record => {
        const version = record.normalized_version || 'original';
        if (groupedData[version]) {
          // Only store unique stats per version
          if (!versionStats[version]) {
            versionStats[version] = {
              avg_gas_fee: record.avg_gas_fee,
              total_gas_fee: record.total_gas_fee,
              transaction_count: record.transaction_count
            };
          }
          groupedData[version].push({
            ...record,
            avg_gas_fee: versionStats[version].avg_gas_fee,
            total_gas_fee: versionStats[version].total_gas_fee,
            transaction_count: versionStats[version].transaction_count
          });
        }
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