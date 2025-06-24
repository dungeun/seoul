const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAllCategories() {
  const client = await pool.connect();
  
  try {
    console.log('=== 전체 대분류/중분류 현황 ===\n');
    
    // 1. 대분류별 통계
    const mainCategoryResult = await client.query(`
      SELECT main_category, COUNT(DISTINCT sub_category) as sub_count, COUNT(*) as total_count
      FROM carbon_tech_posts
      GROUP BY main_category
      ORDER BY main_category
    `);
    
    console.log('【대분류 목록】');
    mainCategoryResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.main_category} - 중분류 ${row.sub_count}개, 총 ${row.total_count}개 데이터`);
    });
    
    // 2. 대분류별 중분류 상세
    console.log('\n\n【대분류별 중분류 상세】');
    
    for (const mainRow of mainCategoryResult.rows) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`[${mainRow.main_category}] (총 ${mainRow.total_count}개)`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      const subCategoryResult = await client.query(`
        SELECT sub_category, COUNT(*) as count
        FROM carbon_tech_posts
        WHERE main_category = $1
        GROUP BY sub_category
        ORDER BY sub_category
      `, [mainRow.main_category]);
      
      subCategoryResult.rows.forEach((subRow, index) => {
        console.log(`  ${index + 1}. ${subRow.sub_category}: ${subRow.count}개`);
      });
    }
    
    // 3. 전체 통계
    const totalResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`\n\n【전체 통계】`);
    console.log(`총 레코드 수: ${totalResult.rows[0].count}개`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllCategories();