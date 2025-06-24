const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function checkBoard() {
  try {
    const result = await pool.query("SELECT id, name, slug, type FROM boards WHERE slug = 'green_campus_group'");
    console.log('게시판 정보:', result.rows[0]);
    
    if (result.rows[0]) {
      const boardId = result.rows[0].id;
      const banners = await pool.query('SELECT * FROM board_banners WHERE board_id = $1 ORDER BY order_index', [boardId]);
      console.log('\n배너 개수:', banners.rows.length);
      
      if (banners.rows.length > 0) {
        console.log('\n배너 목록:');
        banners.rows.forEach((banner, idx) => {
          console.log(`\n배너 ${idx + 1}:`);
          console.log('  - ID:', banner.id);
          console.log('  - 제목:', banner.title);
          console.log('  - 이미지:', banner.image_url);
          console.log('  - 활성화:', banner.is_active);
          console.log('  - 순서:', banner.order_index);
        });
      } else {
        console.log('\n배너가 없습니다!');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkBoard();