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

// Category mapping
const categoryMapping = {
  '탄소중립 기술개발': 'carbon_neutral_tech',
  '신재생에너지': 'renewable_energy',
  '에너지 효율화': 'energy_efficiency',
  '탄소 포집·활용·저장(CCUS)': 'ccus',
  '친환경 모빌리티': 'eco_mobility',
  '순환경제': 'circular_economy',
  '기후변화 적응': 'climate_adaptation'
};

const subCategoryMapping = {
  '수소 분야 (생산, 운반, 저장 등)': 'hydrogen',
  '태양광': 'solar',
  '풍력': 'wind',
  '바이오에너지': 'bio_energy',
  '지열': 'geothermal',
  '건물 에너지 효율화': 'building_efficiency',
  '산업 에너지 효율화': 'industrial_efficiency',
  '수송 에너지 효율화': 'transport_efficiency',
  '탄소 포집': 'carbon_capture',
  '탄소 활용': 'carbon_utilization',
  '탄소 저장': 'carbon_storage',
  '전기차': 'electric_vehicle',
  '수소차': 'hydrogen_vehicle',
  '자율주행': 'autonomous_driving',
  '재활용·재사용': 'recycling',
  '폐기물 에너지화': 'waste_to_energy',
  '기후 예측·모니터링': 'climate_monitoring',
  '기후 적응 기술': 'climate_adaptation_tech'
};

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
    console.log('Starting carbon tech data import...');
    
    // Read CSV data
    const records = await readCSV();
    console.log(`Found ${records.length} records in CSV`);

    client = await pool.connect();
    
    // Start transaction
    await client.query('BEGIN');

    // Clear existing data (optional - remove if you want to append)
    console.log('Clearing existing carbon_tech_posts data...');
    await client.query('TRUNCATE TABLE carbon_tech_posts RESTART IDENTITY CASCADE');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      
      // Skip header rows or empty records
      if (!record || record.length < 5) {
        continue;
      }

      try {
        // Extract fields from CSV
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

        // Get mapped categories
        const mappedMainCategory = categoryMapping[mainCategory] || mainCategory;
        const mappedSubCategory = subCategoryMapping[subCategory] || subCategory;

        // Extract department from name if it contains parentheses
        let department = '';
        let cleanName = name;
        const match = name.match(/(.+?)\((.+?)\)/);
        if (match) {
          cleanName = match[1].trim();
          department = match[2].trim();
        }

        // Insert into database
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
          mappedMainCategory,
          mappedSubCategory,
          orderIndex,
          'published'
        ];

        const result = await client.query(query, values);
        successCount++;
        
        console.log(`✓ Imported: ${cleanName} (${mappedMainCategory} > ${mappedSubCategory})`);
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
    
    if (errors.length > 0) {
      console.log('\n=== Error Details ===');
      errors.slice(0, 10).forEach(err => {
        console.log(`Row ${err.row}: ${err.error}`);
        console.log(`Data:`, err.data);
      });
      
      if (errors.length > 10) {
        console.log(`... and ${errors.length - 10} more errors`);
      }
    }

    // Verify import
    const countResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`\nTotal records in database: ${countResult.rows[0].count}`);

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