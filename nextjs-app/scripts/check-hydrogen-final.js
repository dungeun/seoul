const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  const client = await pool.connect();
  
  try {
    console.log('=== 수소 분야 데이터 최종 확인 ===\n');
    
    // 1. 정확한 중분류명으로 검색
    const exactQuery = `
      SELECT id, name, department, main_category, sub_category, screenshot_url
      FROM carbon_tech_posts 
      WHERE sub_category = '수소 분야 (생산, 운반, 저장 등)'
      ORDER BY order_index, name
    `;
    
    const exactResult = await client.query(exactQuery);
    console.log(`"수소 분야 (생산, 운반, 저장 등)" 정확히 일치: ${exactResult.rows.length}개\n`);
    
    if (exactResult.rows.length > 0) {
      exactResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (${row.department})`);
        console.log(`   스크린샷: ${row.screenshot_url ? '있음' : '없음'}`);
      });
    }
    
    // 2. 전체 카테고리 목록
    console.log('\n=== 모든 중분류 목록 ===');
    const allSubCategoriesQuery = `
      SELECT DISTINCT sub_category, COUNT(*) as count
      FROM carbon_tech_posts
      WHERE main_category = '탄소중립 기술개발'
      GROUP BY sub_category
      ORDER BY sub_category
    `;
    
    const allSubResult = await client.query(allSubCategoriesQuery);
    allSubResult.rows.forEach(row => {
      console.log(`- ${row.sub_category}: ${row.count}개`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();