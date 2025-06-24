const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function checkPosts() {
  try {
    // info 게시판 찾기
    const boardResult = await pool.query("SELECT id FROM boards WHERE slug = 'info'");
    if (boardResult.rows.length === 0) {
      console.log('info 게시판을 찾을 수 없습니다');
      return;
    }
    
    const boardId = boardResult.rows[0].id;
    console.log('info 게시판 ID:', boardId);
    
    // 최근 게시물 확인
    const posts = await pool.query(
      'SELECT id, title, featured_image, thumbnail_url, created_at FROM posts WHERE board_id = $1 ORDER BY created_at DESC LIMIT 5',
      [boardId]
    );
    
    console.log('\n최근 게시물:');
    posts.rows.forEach((post, idx) => {
      console.log(`\n게시물 ${idx + 1}:`);
      console.log('  - ID:', post.id);
      console.log('  - 제목:', post.title);
      console.log('  - featured_image:', post.featured_image || '없음');
      console.log('  - thumbnail_url:', post.thumbnail_url || '없음');
      console.log('  - 작성일:', post.created_at);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPosts();