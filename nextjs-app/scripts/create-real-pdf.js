#!/usr/bin/env node

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// PDF 생성을 위한 pdfkit 설치 확인
try {
  require.resolve('pdfkit');
} catch(e) {
  console.log('pdfkit이 설치되어 있지 않습니다. 설치하려면:');
  console.log('npm install pdfkit');
  process.exit(1);
}

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

// 간단한 PDF 생성
function createSamplePDF(filename, title, content) {
  const doc = new PDFDocument();
  const filePath = path.join(uploadsDir, filename);
  
  doc.pipe(fs.createWriteStream(filePath));
  
  // 제목
  doc.fontSize(24)
     .text(title, 50, 50);
  
  // 내용
  doc.fontSize(12)
     .moveDown()
     .text(content, {
       width: 500,
       align: 'justify'
     });
  
  doc.end();
  
  console.log(`✅ PDF 생성됨: ${filename}`);
}

// 샘플 PDF 생성
createSamplePDF(
  '2024_carbon_neutral_guide.pdf',
  '2024년 탄소중립 실천 가이드북',
  `서울대학교 탄소중립 실천 가이드북

이 가이드북은 서울대학교 구성원들이 일상생활에서 탄소중립을 실천할 수 있는 방법을 안내합니다.

1. 에너지 절약
- 사용하지 않는 전기제품의 플러그를 뽑아주세요
- LED 조명을 사용하여 전력 소비를 줄여주세요
- 실내 적정온도를 유지해주세요 (여름 26°C, 겨울 20°C)

2. 친환경 교통 이용
- 대중교통을 적극 활용해주세요
- 가까운 거리는 도보나 자전거를 이용해주세요
- 전기차나 하이브리드 차량 이용을 고려해주세요

3. 자원 재활용
- 분리수거를 철저히 실천해주세요
- 일회용품 사용을 최소화해주세요
- 재사용 가능한 제품을 선택해주세요

4. 친환경 소비
- 탄소발자국이 적은 제품을 선택해주세요
- 지역 농산물을 구매해주세요
- 과대포장 제품을 피해주세요

우리 모두의 작은 실천이 모여 큰 변화를 만들 수 있습니다.
함께 탄소중립 캠퍼스를 만들어갑시다!`
);

console.log('\nPDF 생성 완료!');