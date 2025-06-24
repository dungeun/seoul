const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkHydrogenData() {
  const client = await pool.connect();
  
  try {
    console.log('=== 수소 분야 데이터 확인 ===\n');
    
    // 1. 수소 관련 모든 데이터 확인
    const hydrogenQuery = `
      SELECT id, name, department, url, main_category, sub_category, screenshot_url, status
      FROM carbon_tech_posts 
      WHERE sub_category LIKE '%수소%'
      ORDER BY main_category, sub_category, order_index, name
    `;
    
    const hydrogenResult = await client.query(hydrogenQuery);
    console.log(`수소 관련 전체 데이터: ${hydrogenResult.rows.length}개\n`);
    
    if (hydrogenResult.rows.length > 0) {
      hydrogenResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.name} (${row.department})`);
        console.log(`   대분류: ${row.main_category}`);
        console.log(`   중분류: ${row.sub_category}`);
        console.log(`   URL: ${row.url}`);
        console.log(`   스크린샷: ${row.screenshot_url || '없음'}`);
        console.log(`   상태: ${row.status}\n`);
      });
    }
    
    // 2. 카테고리별 통계
    const statsQuery = `
      SELECT main_category, sub_category, COUNT(*) as count
      FROM carbon_tech_posts
      WHERE main_category = '탄소중립 기술개발'
      GROUP BY main_category, sub_category
      ORDER BY sub_category
    `;
    
    const statsResult = await client.query(statsQuery);
    console.log('\n=== 탄소중립 기술개발 카테고리별 통계 ===');
    statsResult.rows.forEach(row => {
      console.log(`${row.sub_category}: ${row.count}개`);
    });
    
    // 3. 매핑된 카테고리 확인
    const mappedQuery = `
      SELECT DISTINCT main_category, sub_category
      FROM carbon_tech_posts
      WHERE main_category IN ('carbon_neutral_tech', 'renewable_energy', 'energy_efficiency', 'ccus', 'eco_mobility', 'circular_economy', 'climate_adaptation')
      ORDER BY main_category, sub_category
    `;
    
    const mappedResult = await client.query(mappedQuery);
    console.log('\n=== 영문 매핑된 카테고리 ===');
    mappedResult.rows.forEach(row => {
      console.log(`${row.main_category} > ${row.sub_category}`);
    });
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkHydrogenData();