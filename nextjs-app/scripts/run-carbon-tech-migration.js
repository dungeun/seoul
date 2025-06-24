const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-carbon-tech-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running carbon-tech table migration...');
    await pool.query(sql);
    console.log('Carbon-tech table created successfully!');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();