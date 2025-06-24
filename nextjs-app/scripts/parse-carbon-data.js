const fs = require('fs');
const path = require('path');

// CSV 파일 읽기
const csvPath = path.join(__dirname, '../../seoul_link_end.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// CSV 파싱 - 줄바꿈이 있는 필드 처리
const data = {};
const records = [];
let currentRecord = '';
let inQuotes = false;

for (let i = 0; i < csvContent.length; i++) {
  const char = csvContent[i];
  
  if (char === '"' && (i === 0 || csvContent[i-1] === ',' || csvContent[i-1] === '\n')) {
    inQuotes = true;
  } else if (char === '"' && inQuotes && (i === csvContent.length - 1 || csvContent[i+1] === ',' || csvContent[i+1] === '\n')) {
    inQuotes = false;
  }
  
  if (char === '\n' && !inQuotes) {
    if (currentRecord.trim()) {
      records.push(currentRecord);
    }
    currentRecord = '';
  } else {
    currentRecord += char;
  }
}

if (currentRecord.trim()) {
  records.push(currentRecord);
}

// 각 레코드 파싱
records.forEach(record => {
  const fields = [];
  let currentField = '';
  let inField = false;
  
  for (let i = 0; i < record.length; i++) {
    const char = record[i];
    
    if (char === '"' && (i === 0 || record[i-1] === ',')) {
      inField = true;
      currentField = '';
    } else if (char === '"' && inField && (i === record.length - 1 || record[i+1] === ',')) {
      inField = false;
      fields.push(currentField);
      i++; // Skip comma
      currentField = '';
    } else if (char === ',' && !inField) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  if (currentField) {
    fields.push(currentField);
  }
  
  if (fields.length < 4) return;
  
  const mainCategory = fields[0].replace(/\n/g, ' ').trim();
  const subCategory = fields[1].replace(/\n/g, ' ').trim();
  const researcher = fields[2].trim();
  const url = fields[3].trim();
  
  // 이름과 학과 분리
  const nameMatch = researcher.match(/^([^(]+)\(([^)]+)\)$/);
  if (!nameMatch) return;
  
  const name = nameMatch[1].trim();
  const department = nameMatch[2].trim();
  
  // 데이터 구조 생성
  if (!data[mainCategory]) {
    data[mainCategory] = {};
  }
  
  if (!data[mainCategory][subCategory]) {
    data[mainCategory][subCategory] = [];
  }
  
  data[mainCategory][subCategory].push({
    name,
    department,
    url: url || '#'
  });
});

// 카운트 계산
const counts = {};
Object.keys(data).forEach(main => {
  counts[main] = {};
  Object.keys(data[main]).forEach(sub => {
    counts[main][sub] = data[main][sub].length;
  });
});

// 결과 출력
console.log('=== 대분류별 중분류 및 연구자 수 ===');
Object.keys(data).forEach(main => {
  console.log(`\n${main}:`);
  Object.keys(data[main]).forEach(sub => {
    console.log(`  - ${sub}: ${data[main][sub].length}명`);
  });
});

// JSON 파일로 저장
const output = {
  data,
  counts,
  mainCategories: Object.keys(data),
  subCategoriesByMain: Object.keys(data).reduce((acc, main) => {
    acc[main] = Object.keys(data[main]);
    return acc;
  }, {})
};

fs.writeFileSync(
  path.join(__dirname, '../lib/carbon-tech-data.json'),
  JSON.stringify(output, null, 2)
);

console.log('\n✅ carbon-tech-data.json 파일이 생성되었습니다.');