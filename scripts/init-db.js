const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function initializeDatabase() {
    try {
        // Read SQL file
        const sql = fs.readFileSync(
            path.join(__dirname, 'init-db.sql'),
            'utf8'
        );

        // Execute SQL
        await pool.query(sql);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = initializeDatabase; 