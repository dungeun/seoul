const { Pool } = require('pg');

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/seoul',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function checkPostsData() {
  try {
    console.log('Checking posts data...');
    
    const posts = await pool.query(`
      SELECT id, title, featured_image, thumbnail_url, board_id, created_at
      FROM posts 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('Recent posts:');
    posts.rows.forEach(post => {
      console.log(`ID: ${post.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Featured Image: ${post.featured_image || 'NULL'}`);
      console.log(`Thumbnail URL: ${post.thumbnail_url || 'NULL'}`);
      console.log(`Board ID: ${post.board_id}`);
      console.log('---');
    });
    
    // Check info board specifically
    const infoBoard = await pool.query(`
      SELECT id FROM boards WHERE slug = 'info'
    `);
    
    if (infoBoard.rows.length > 0) {
      const infoBoardId = infoBoard.rows[0].id;
      console.log(`Info board ID: ${infoBoardId}`);
      
      const infoPosts = await pool.query(`
        SELECT id, title, featured_image, thumbnail_url
        FROM posts 
        WHERE board_id = $1
        ORDER BY created_at DESC
      `, [infoBoardId]);
      
      console.log(`\nInfo board posts (${infoPosts.rows.length} total):`);
      infoPosts.rows.forEach(post => {
        console.log(`ID: ${post.id}, Title: ${post.title}`);
        console.log(`Featured: ${post.featured_image || 'NULL'}`);
        console.log(`Thumbnail: ${post.thumbnail_url || 'NULL'}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking posts data:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

checkPostsData();