#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// uploads 디렉토리 생성
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 간단한 텍스트 파일들을 생성 (실제 PDF 대신)
const sampleFiles = [
  {
    name: '2024_carbon_neutral_guide.pdf',
    content: `탄소중립 실천 가이드북 2024

1. 에너지 절약
- 사용하지 않는 전기제품 플러그 뽑기
- LED 조명 사용
- 적정 실내온도 유지 (여름 26도, 겨울 20도)

2. 친환경 교통
- 대중교통 이용
- 자전거, 도보 이용
- 전기차 사용

3. 자원 재활용
- 분리수거 철저히 하기
- 일회용품 사용 줄이기
- 재사용 가능한 제품 사용`
  },
  {
    name: 'green_campus_plan_2024-2028.pdf',
    content: `서울대학교 그린캠퍼스 조성 계획서 (2024-2028)

비전: 2030 탄소중립 캠퍼스 실현

주요 목표:
1. 온실가스 배출량 50% 감축 (2024년 대비)
2. 재생에너지 사용 비율 30% 달성
3. 폐기물 재활용률 70% 달성

추진 전략:
- 에너지 효율화
- 재생에너지 확대
- 친환경 교통체계 구축
- 순환경제 실현`
  },
  {
    name: 'renewable_energy_status_2024.xlsx',
    content: `재생에너지 도입 현황 (2024)

태양광 발전 시설:
- 설치 건물: 15개동
- 총 발전용량: 2.5MW
- 연간 발전량: 3,000MWh

지열 에너지 시설:
- 설치 건물: 5개동
- 냉난방 절감률: 30%`
  }
];

// 파일 생성
sampleFiles.forEach(file => {
  const filePath = path.join(uploadsDir, file.name);
  fs.writeFileSync(filePath, file.content, 'utf8');
  console.log(`✅ 생성됨: ${file.name}`);
});

console.log('\n샘플 파일 생성 완료!');
console.log(`위치: ${uploadsDir}`);