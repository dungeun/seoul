const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function removeUniqueConstraint() {
  const client = await pool.connect();
  
  try {
    console.log('=== URL UNIQUE 제약 조건 제거 ===\n');
    
    // 트랜잭션 시작
    await client.query('BEGIN');
    
    // 1. 현재 제약 조건 확인
    const constraintQuery = `
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'carbon_tech_posts' 
        AND constraint_type = 'UNIQUE'
    `;
    
    const constraints = await client.query(constraintQuery);
    console.log('현재 UNIQUE 제약 조건:');
    constraints.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}`);
    });
    
    // 2. URL 관련 UNIQUE 제약 조건 제거
    try {
      await client.query('ALTER TABLE carbon_tech_posts DROP CONSTRAINT IF EXISTS carbon_tech_posts_url_key');
      console.log('\n✓ carbon_tech_posts_url_key 제약 조건 제거됨');
    } catch (e) {
      console.log('\n- carbon_tech_posts_url_key 제약 조건이 없거나 이미 제거됨');
    }
    
    // 3. 인덱스 확인 및 제거
    const indexQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'carbon_tech_posts' 
        AND indexname LIKE '%url%'
    `;
    
    const indexes = await client.query(indexQuery);
    console.log('\nURL 관련 인덱스:');
    for (const row of indexes.rows) {
      console.log(`  - ${row.indexname}`);
      try {
        await client.query(`DROP INDEX IF EXISTS ${row.indexname}`);
        console.log(`    ✓ 제거됨`);
      } catch (e) {
        console.log(`    - 제거 실패: ${e.message}`);
      }
    }
    
    // 커밋
    await client.query('COMMIT');
    console.log('\n✅ URL UNIQUE 제약 조건 제거 완료');
    
    // 4. 테이블 구조 확인
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'carbon_tech_posts'
      ORDER BY ordinal_position
    `);
    
    console.log('\n=== 현재 테이블 구조 ===');
    tableInfo.rows.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default || ''}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

removeUniqueConstraint()
  .then(() => {
    console.log('\n작업 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n작업 실패:', error);
    process.exit(1);
  });