const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function readCSV() {
  const csvPath = path.join(__dirname, '..', '..', 'seoul_link_end.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(csvContent, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
    quote: '"',
    escape: '"',
    delimiter: ','
  });

  return records.map(record => {
    return record.map(field => {
      if (typeof field === 'string') {
        return field.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      }
      return field;
    });
  });
}

async function importAllData() {
  let client;
  try {
    console.log('=== 전체 데이터 재import (중복 허용) ===\n');
    
    // Read CSV data
    const records = await readCSV();
    console.log(`CSV 레코드 수: ${records.length}개`);

    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');

    // Clear existing data
    console.log('기존 데이터 삭제 중...');
    await client.query('TRUNCATE TABLE carbon_tech_posts RESTART IDENTITY CASCADE');

    let successCount = 0;
    let errorCount = 0;
    let hydrogenCount = 0;
    const categoryStats = {};

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      if (!record || record.length < 5) {
        continue;
      }

      try {
        const mainCategory = record[0]?.trim();
        const subCategory = record[1]?.trim();
        const name = record[2]?.trim();
        const url = record[3]?.trim();
        const orderIndex = parseInt(record[5]) || i;

        // Skip if essential fields are missing
        if (!mainCategory || !subCategory || !name || !url) {
          continue;
        }

        // Skip if URL is not valid
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          console.log(`잘못된 URL 형식 스킵: ${url}`);
          continue;
        }

        // Extract department from name
        let department = '';
        let cleanName = name;
        const match = name.match(/(.+?)\((.+?)\)/);
        if (match) {
          cleanName = match[1].trim();
          department = match[2].trim();
        }

        // 카테고리 통계
        if (!categoryStats[mainCategory]) {
          categoryStats[mainCategory] = {};
        }
        if (!categoryStats[mainCategory][subCategory]) {
          categoryStats[mainCategory][subCategory] = 0;
        }
        categoryStats[mainCategory][subCategory]++;

        // 수소 카운트
        if (subCategory.includes('수소')) {
          hydrogenCount++;
        }

        // 단순 INSERT (중복 허용)
        const query = `
          INSERT INTO carbon_tech_posts 
          (name, department, url, main_category, sub_category, order_index, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const values = [
          cleanName,
          department,
          url,
          mainCategory,
          subCategory,
          orderIndex,
          'published'
        ];

        await client.query(query, values);
        successCount++;
        
        if (subCategory.includes('수소')) {
          console.log(`✓ [수소] ${cleanName} - ${subCategory}`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`✗ 행 ${i + 1} 오류: ${error.message}`);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n=== Import 결과 ===');
    console.log(`성공: ${successCount}개`);
    console.log(`실패: ${errorCount}개`);
    console.log(`수소 관련 데이터: ${hydrogenCount}개`);
    
    console.log('\n=== 카테고리별 통계 ===');
    Object.keys(categoryStats).forEach(mainCat => {
      console.log(`\n[${mainCat}]`);
      Object.keys(categoryStats[mainCat]).forEach(subCat => {
        console.log(`  - ${subCat}: ${categoryStats[mainCat][subCat]}개`);
      });
    });

    // 최종 확인
    const totalResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`\n데이터베이스 전체 레코드: ${totalResult.rows[0].count}개`);
    
    const hydrogenResult = await client.query(`
      SELECT COUNT(*) FROM carbon_tech_posts 
      WHERE sub_category = '수소 분야 (생산, 운반, 저장 등)'
    `);
    console.log(`수소 분야 (생산, 운반, 저장 등) 레코드: ${hydrogenResult.rows[0].count}개`);

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Import 실패:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run import
importAllData()
  .then(() => {
    console.log('\nImport 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport 실패:', error);
    process.exit(1);
  });