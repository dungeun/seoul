const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateBoardType() {
  try {
    // emission_reduce 게시판의 type을 gallery-01로 설정
    const result = await pool.query(
      "UPDATE boards SET type = 'gallery-01' WHERE slug = 'emission_reduce' RETURNING *"
    );
    
    console.log('Updated board:', result.rows[0]);
    
    // 확인
    const check = await pool.query(
      "SELECT * FROM boards WHERE slug = 'emission_reduce'"
    );
    console.log('Verification:', check.rows[0]);
    
  } catch (error) {
    console.error('Error updating board type:', error);
  } finally {
    await pool.end();
  }
}

updateBoardType();