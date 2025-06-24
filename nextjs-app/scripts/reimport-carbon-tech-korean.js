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
  
  // Parse CSV with proper options to handle multi-line fields
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

  // Clean up records - remove line breaks from fields
  return records.map(record => {
    return record.map(field => {
      if (typeof field === 'string') {
        return field.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      }
      return field;
    });
  });
}

async function importData() {
  let client;
  try {
    console.log('Starting carbon tech data re-import with Korean categories...');
    
    // Read CSV data
    const records = await readCSV();
    console.log(`Found ${records.length} records in CSV`);

    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');

    // Clear existing data
    console.log('Clearing existing carbon_tech_posts data...');
    await client.query('TRUNCATE TABLE carbon_tech_posts RESTART IDENTITY CASCADE');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 카테고리별 통계
    const categoryStats = {};

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Skip header rows or empty records
      if (!record || record.length < 5) {
        continue;
      }

      try {
        // Extract fields from CSV - 한글 그대로 사용
        const mainCategory = record[0]?.trim();
        const subCategory = record[1]?.trim();
        const name = record[2]?.trim();
        const url = record[3]?.trim();
        const orderIndex = parseInt(record[5]) || i;

        // Skip if essential fields are missing
        if (!mainCategory || !subCategory || !name || !url) {
          console.log(`Skipping row ${i + 1}: Missing essential fields`);
          continue;
        }

        // Skip if URL is not valid
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          console.log(`Skipping row ${i + 1}: Invalid URL format: ${url}`);
          continue;
        }

        // Extract department from name if it contains parentheses
        let department = '';
        let cleanName = name;
        const match = name.match(/(.+?)\((.+?)\)/);
        if (match) {
          cleanName = match[1].trim();
          department = match[2].trim();
        }

        // 카테고리 통계 업데이트
        if (!categoryStats[mainCategory]) {
          categoryStats[mainCategory] = {};
        }
        if (!categoryStats[mainCategory][subCategory]) {
          categoryStats[mainCategory][subCategory] = 0;
        }
        categoryStats[mainCategory][subCategory]++;

        // Insert into database - 한글 카테고리 그대로 저장
        const query = `
          INSERT INTO carbon_tech_posts 
          (name, department, url, main_category, sub_category, order_index, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (url) DO UPDATE SET
            name = EXCLUDED.name,
            department = EXCLUDED.department,
            main_category = EXCLUDED.main_category,
            sub_category = EXCLUDED.sub_category,
            order_index = EXCLUDED.order_index,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id
        `;

        const values = [
          cleanName,
          department,
          url,
          mainCategory,  // 한글 그대로
          subCategory,   // 한글 그대로
          orderIndex,
          'published'
        ];

        const result = await client.query(query, values);
        successCount++;
        
        if (subCategory.includes('수소')) {
          console.log(`✓ [수소] ${cleanName} - ${mainCategory} > ${subCategory}`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          row: i + 1,
          data: record,
          error: error.message
        });
        console.error(`✗ Error on row ${i + 1}:`, error.message);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n=== Import Summary ===');
    console.log(`Total records processed: ${records.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    
    console.log('\n=== Category Statistics ===');
    Object.keys(categoryStats).forEach(mainCat => {
      console.log(`\n[${mainCat}]`);
      Object.keys(categoryStats[mainCat]).forEach(subCat => {
        console.log(`  - ${subCat}: ${categoryStats[mainCat][subCat]}개`);
      });
    });
    
    if (errors.length > 0) {
      console.log('\n=== Error Details ===');
      errors.slice(0, 10).forEach(err => {
        console.log(`Row ${err.row}: ${err.error}`);
      });
      
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`);
      }
    }

    // Verify import - 수소 카테고리 확인
    const hydrogenResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM carbon_tech_posts 
      WHERE sub_category LIKE '%수소%'
    `);
    console.log(`\n수소 관련 데이터: ${hydrogenResult.rows[0].count}개`);

    // 전체 데이터 확인
    const countResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`전체 데이터: ${countResult.rows[0].count}개`);

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Import failed:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run import
importData()
  .then(() => {
    console.log('\nImport completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nImport failed:', error);
    process.exit(1);
  });