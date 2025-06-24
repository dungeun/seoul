const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function updateBoardType() {
  try {
    // 먼저 현재 boards 테이블의 type 값들 확인
    const typesResult = await pool.query(`
      SELECT DISTINCT type FROM boards
    `);
    
    console.log('현재 사용 중인 게시판 타입:', typesResult.rows.map(r => r.type));

    // 기존 제약 조건 확인
    const constraintResult = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conname = 'boards_type_check'
    `);

    if (constraintResult.rows.length > 0) {
      // 기존 제약 조건 삭제
      await pool.query('ALTER TABLE boards DROP CONSTRAINT boards_type_check');
      console.log('✅ 기존 type 제약 조건 삭제');
    }

    // type 컬럼을 VARCHAR로 변경 (이미 VARCHAR일 수도 있음)
    try {
      await pool.query('ALTER TABLE boards ALTER COLUMN type TYPE VARCHAR(50)');
      console.log('✅ type 컬럼을 VARCHAR(50)으로 변경');
    } catch (e) {
      console.log('⚠️  type 컬럼은 이미 VARCHAR 타입입니다.');
    }

    // 새로운 제약 조건 추가 (banner 포함)
    await pool.query(`
      ALTER TABLE boards 
      ADD CONSTRAINT boards_type_check 
      CHECK (type IN ('notice', 'general', 'link', 'banner'))
    `);
    
    console.log('✅ banner 타입이 추가된 새로운 제약 조건 생성');
    console.log('🎉 게시판 타입 업데이트 완료! 이제 banner 타입을 사용할 수 있습니다.');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

updateBoardType();