const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function initBoardBanners() {
  try {
    // 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS board_banners (
        id SERIAL PRIMARY KEY,
        board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        subtitle VARCHAR(200),
        image_url VARCHAR(500) NOT NULL,
        link_url VARCHAR(500),
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ board_banners 테이블 생성 완료');

    // 트리거 생성
    await pool.query(`
      DROP TRIGGER IF EXISTS update_board_banners_updated_at ON board_banners;
      CREATE TRIGGER update_board_banners_updated_at 
      BEFORE UPDATE ON board_banners 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);

    // 인덱스 생성
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_board_banners_board_id ON board_banners(board_id);
      CREATE INDEX IF NOT EXISTS idx_board_banners_order ON board_banners(board_id, order_index);
    `);

    console.log('✅ 인덱스 및 트리거 생성 완료');

    // boards 테이블에 type 컬럼에 'banner' 옵션 추가
    await pool.query(`
      ALTER TABLE boards 
      ALTER COLUMN type TYPE VARCHAR(50);
    `);

    console.log('🎉 board_banners 테이블 초기화 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

initBoardBanners();