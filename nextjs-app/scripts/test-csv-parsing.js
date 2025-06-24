const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Test CSV parsing
async function testCSVParsing() {
  try {
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
    const cleanedRecords = records.map(record => {
      return record.map(field => {
        if (typeof field === 'string') {
          return field.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
        }
        return field;
      });
    });

    console.log(`Total records found: ${cleanedRecords.length}`);
    console.log('\nFirst 5 records:');
    
    cleanedRecords.slice(0, 5).forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  Main Category: ${record[0]}`);
      console.log(`  Sub Category: ${record[1]}`);
      console.log(`  Name: ${record[2]}`);
      console.log(`  URL: ${record[3]}`);
      console.log(`  Field 5: ${record[4]}`);
      console.log(`  Order Index: ${record[5]}`);
    });

    // Check for any records with missing essential fields
    const invalidRecords = cleanedRecords.filter((record, index) => {
      const hasMainCategory = record[0] && record[0].trim();
      const hasSubCategory = record[1] && record[1].trim();
      const hasName = record[2] && record[2].trim();
      const hasUrl = record[3] && record[3].trim();
      
      return !hasMainCategory || !hasSubCategory || !hasName || !hasUrl;
    });

    console.log(`\nRecords with missing essential fields: ${invalidRecords.length}`);
    
    if (invalidRecords.length > 0) {
      console.log('\nFirst 3 invalid records:');
      invalidRecords.slice(0, 3).forEach((record, index) => {
        console.log(`\nInvalid Record ${index + 1}:`, record);
      });
    }

    // Check unique categories
    const mainCategories = new Set(cleanedRecords.map(r => r[0]).filter(Boolean));
    const subCategories = new Set(cleanedRecords.map(r => r[1]).filter(Boolean));

    console.log('\n=== Unique Main Categories ===');
    mainCategories.forEach(cat => console.log(`  - ${cat}`));

    console.log('\n=== Unique Sub Categories ===');
    subCategories.forEach(cat => console.log(`  - ${cat}`));

  } catch (error) {
    console.error('Error testing CSV parsing:', error);
  }
}

testCSVParsing();