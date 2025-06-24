const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkScreenshots() {
  try {
    // link_posts 테이블에서 스크린샷이 있는 데이터 확인
    const result = await pool.query(`
      SELECT title, link_url, image_url 
      FROM link_posts 
      WHERE image_url IS NOT NULL AND image_url != ''
      ORDER BY id DESC
      LIMIT 20
    `);
    
    console.log('=== link_posts 스크린샷 데이터 ===');
    result.rows.forEach(row => {
      console.log(`제목: ${row.title}`);
      console.log(`URL: ${row.link_url}`);
      console.log(`스크린샷: ${row.image_url}`);
      console.log('---');
    });
    
    // 전체 카운트
    const count = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' THEN 1 END) as with_screenshot
      FROM link_posts
    `);
    
    console.log(`\n총 ${count.rows[0].total}개 중 ${count.rows[0].with_screenshot}개 스크린샷 보유`);
    
    // carbon_tech_posts도 확인
    const carbonCount = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN screenshot_url IS NOT NULL AND screenshot_url != '' THEN 1 END) as with_screenshot
      FROM carbon_tech_posts
    `);
    
    console.log(`\n=== carbon_tech_posts ===`);
    console.log(`총 ${carbonCount.rows[0].total}개 중 ${carbonCount.rows[0].with_screenshot}개 스크린샷 보유`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkScreenshots();