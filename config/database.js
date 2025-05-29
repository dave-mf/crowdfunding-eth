const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || process.env.USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'crowdfunding',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 