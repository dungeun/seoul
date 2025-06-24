const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verifyData() {
  const client = await pool.connect();
  
  try {
    console.log('=== 전체 데이터 검증 ===\n');
    
    // 1. 전체 통계
    const totalResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`전체 레코드: ${totalResult.rows[0].count}개`);
    
    const withScreenshotResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts WHERE screenshot_url IS NOT NULL');
    console.log(`스크린샷 있음: ${withScreenshotResult.rows[0].count}개\n`);
    
    // 2. 카테고리별 통계
    const categoryResult = await client.query(`
      SELECT main_category, sub_category, COUNT(*) as count
      FROM carbon_tech_posts
      GROUP BY main_category, sub_category
      ORDER BY main_category, sub_category
    `);
    
    console.log('=== 카테고리별 데이터 ===');
    let currentMain = '';
    categoryResult.rows.forEach(row => {
      if (row.main_category !== currentMain) {
        currentMain = row.main_category;
        console.log(`\n[${currentMain}]`);
      }
      console.log(`  ${row.sub_category}: ${row.count}개`);
    });
    
    // 3. 수소 분야 상세 확인
    console.log('\n\n=== 수소 분야 상세 ===');
    const hydrogenResult = await client.query(`
      SELECT id, name, department, main_category, sub_category, url, screenshot_url
      FROM carbon_tech_posts
      WHERE sub_category = '수소 분야 (생산, 운반, 저장 등)'
      ORDER BY name
    `);
    
    console.log(`수소 분야 데이터: ${hydrogenResult.rows.length}개\n`);
    hydrogenResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.department})`);
      console.log(`   URL: ${row.url}`);
      console.log(`   스크린샷: ${row.screenshot_url ? '있음' : '없음'}\n`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyData();