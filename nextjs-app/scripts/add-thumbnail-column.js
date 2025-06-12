const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/seoul',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function addThumbnailColumn() {
  try {
    console.log('Adding thumbnail_url column to posts table...');
    
    // thumbnail_url 컬럼 추가
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500)
    `);
    
    console.log('✅ thumbnail_url column added successfully');
    
  } catch (error) {
    console.error('❌ Error adding thumbnail column:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

addThumbnailColumn();