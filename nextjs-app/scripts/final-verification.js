const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalVerification() {
  const client = await pool.connect();
  
  try {
    console.log('=== 최종 데이터 검증 ===\n');
    
    // 1. 전체 통계
    const totalResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`전체 레코드: ${totalResult.rows[0].count}개`);
    
    const withScreenshotResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts WHERE screenshot_url IS NOT NULL');
    console.log(`스크린샷 있음: ${withScreenshotResult.rows[0].count}개`);
    console.log(`스크린샷 없음: ${totalResult.rows[0].count - withScreenshotResult.rows[0].count}개\n`);
    
    // 2. 수소 분야 상세
    console.log('=== 수소 분야 (생산, 운반, 저장 등) ===');
    const hydrogenResult = await client.query(`
      SELECT name, department, screenshot_url
      FROM carbon_tech_posts
      WHERE sub_category = '수소 분야 (생산, 운반, 저장 등)'
      ORDER BY order_index, name
    `);
    
    console.log(`총 ${hydrogenResult.rows.length}개\n`);
    
    let withScreenshot = 0;
    let withoutScreenshot = 0;
    
    hydrogenResult.rows.forEach((row, index) => {
      const hasScreenshot = row.screenshot_url ? true : false;
      if (hasScreenshot) withScreenshot++;
      else withoutScreenshot++;
      
      console.log(`${index + 1}. ${row.name} (${row.department}) - 스크린샷: ${hasScreenshot ? '✓' : '✗'}`);
    });
    
    console.log(`\n스크린샷 있음: ${withScreenshot}개`);
    console.log(`스크린샷 없음: ${withoutScreenshot}개`);
    
    // 3. 카테고리별 통계
    console.log('\n=== 탄소중립 기술개발 카테고리별 통계 ===');
    const categoryResult = await client.query(`
      SELECT sub_category, COUNT(*) as total, 
             COUNT(screenshot_url) as with_screenshot
      FROM carbon_tech_posts
      WHERE main_category = '탄소중립 기술개발'
      GROUP BY sub_category
      ORDER BY sub_category
    `);
    
    categoryResult.rows.forEach(row => {
      console.log(`${row.sub_category}: ${row.total}개 (스크린샷: ${row.with_screenshot}개)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

finalVerification();