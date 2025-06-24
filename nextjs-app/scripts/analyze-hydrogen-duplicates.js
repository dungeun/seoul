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

console.log('=== 수소 분야 중복 URL 분석 ===\n');

// URL별로 그룹화
const urlGroups = {};
const hydrogenRecords = [];

cleanedRecords.forEach((record, index) => {
  const mainCategory = record[0];
  const subCategory = record[1];
  const name = record[2];
  const url = record[3];
  
  if (subCategory && subCategory.includes('수소')) {
    hydrogenRecords.push({
      index: index + 1,
      mainCategory,
      subCategory,
      name,
      url
    });
    
    if (!urlGroups[url]) {
      urlGroups[url] = [];
    }
    urlGroups[url].push({
      index: index + 1,
      name,
      subCategory
    });
  }
});

console.log(`총 수소 관련 레코드: ${hydrogenRecords.length}개\n`);

// 중복 URL 찾기
console.log('=== 중복 URL 목록 ===');
let duplicateCount = 0;
Object.entries(urlGroups).forEach(([url, entries]) => {
  if (entries.length > 1) {
    duplicateCount++;
    console.log(`\nURL: ${url}`);
    console.log(`중복 횟수: ${entries.length}번`);
    entries.forEach(entry => {
      console.log(`  - 레코드 ${entry.index}: ${entry.name} (${entry.subCategory})`);
    });
  }
});

console.log(`\n총 중복 URL: ${duplicateCount}개`);
console.log(`고유 URL 수: ${Object.keys(urlGroups).length}개`);

// 고유 URL만 표시
console.log('\n=== 고유 URL 목록 ===');
const uniqueUrls = {};
hydrogenRecords.forEach(record => {
  if (!uniqueUrls[record.url]) {
    uniqueUrls[record.url] = record;
  }
});

Object.values(uniqueUrls).forEach((record, index) => {
  console.log(`${index + 1}. ${record.name} - ${record.url}`);
});