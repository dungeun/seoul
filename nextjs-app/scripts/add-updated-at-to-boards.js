const { Pool } = require('pg');
require('dotenv').config();

async function addUpdatedAtColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Adding updated_at column to boards table...');
    
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'boards' AND column_name = 'updated_at'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('updated_at column already exists in boards table');
      return;
    }
    
    // Add updated_at column
    await pool.query(`
      ALTER TABLE boards 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    
    console.log('✅ Successfully added updated_at column to boards table');
    
    // Update existing rows to have current timestamp
    await pool.query(`
      UPDATE boards 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE updated_at IS NULL
    `);
    
    console.log('✅ Updated existing rows with current timestamp');
    
  } catch (error) {
    console.error('❌ Error adding updated_at column:', error);
  } finally {
    await pool.end();
  }
}

addUpdatedAtColumn();