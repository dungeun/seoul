const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function dropAllUrlConstraints() {
  const client = await pool.connect();
  
  try {
    console.log('=== 모든 URL 제약 조건 제거 ===\n');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    // 1. 모든 제약 조건 확인
    const allConstraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'carbon_tech_posts'
    `);
    
    console.log('모든 제약 조건:');
    allConstraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name} (${row.constraint_type})`);
    });
    
    // 2. unique_carbon_tech_url 제약 조건 제거
    try {
      await client.query('ALTER TABLE carbon_tech_posts DROP CONSTRAINT IF EXISTS unique_carbon_tech_url');
      console.log('\n✓ unique_carbon_tech_url 제약 조건 제거됨');
    } catch (e) {
      console.log(`\n제거 실패: ${e.message}`);
    }
    
    // 커밋
    await client.query('COMMIT');
    
    // 3. 제거 후 제약 조건 재확인
    const remainingConstraints = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'carbon_tech_posts'
    `);
    
    console.log('\n=== 남은 제약 조건 ===');
    remainingConstraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name} (${row.constraint_type})`);
    });
    
    console.log('\n✅ URL 제약 조건 제거 완료!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

dropAllUrlConstraints()
  .then(() => {
    console.log('\n작업 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n작업 실패:', error);
    process.exit(1);
  });