const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// CSV 파일 읽기
const csvPath = path.join(__dirname, '..', '..', 'seoul_link_end.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
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

// Clean up records
const cleanedRecords = records.map(record => {
  return record.map(field => {
    if (typeof field === 'string') {
      return field.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    }
    return field;
  });
});

console.log('=== CSV 카테고리 분석 ===\n');

// 카테고리별 통계
const categoryStats = {};

cleanedRecords.forEach((record, index) => {
  const mainCategory = record[0];
  const subCategory = record[1];
  
  if (!mainCategory || !subCategory) return;
  
  if (!categoryStats[mainCategory]) {
    categoryStats[mainCategory] = {};
  }
  
  if (!categoryStats[mainCategory][subCategory]) {
    categoryStats[mainCategory][subCategory] = 0;
  }
  
  categoryStats[mainCategory][subCategory]++;
});

// 결과 출력
Object.keys(categoryStats).forEach(mainCat => {
  console.log(`\n[${mainCat}]`);
  Object.keys(categoryStats[mainCat]).forEach(subCat => {
    console.log(`  - ${subCat}: ${categoryStats[mainCat][subCat]}개`);
  });
});

// 수소 관련 데이터만 찾기
console.log('\n\n=== 수소 관련 데이터 ===');
cleanedRecords.forEach((record, index) => {
  const subCategory = record[1];
  if (subCategory && subCategory.includes('수소')) {
    console.log(`\n레코드 ${index + 1}:`);
    console.log(`  대분류: ${record[0]}`);
    console.log(`  중분류: ${record[1]}`);
    console.log(`  이름: ${record[2]}`);
    console.log(`  URL: ${record[3]}`);
  }
});