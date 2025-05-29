const { pool } = require('../config/database');

async function resetGasFeeLogs() {
  try {
    // Delete all records from gas_fee_logs table
    await pool.query('TRUNCATE TABLE gas_fee_logs RESTART IDENTITY CASCADE');
    console.log('Successfully reset gas_fee_logs table');
  } catch (error) {
    console.error('Error resetting gas_fee_logs table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

resetGasFeeLogs(); 