const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🗄️ 연혁 데이터 DB 삽입 시작...');
console.log('📍 DB 경로:', dbPath);

// 연혁 테이블 생성
try {
  const db = new Database(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NULL,
      day INTEGER NULL,
      date_text TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ history 테이블 생성 완료');

  // 인덱스 생성
  db.exec('CREATE INDEX IF NOT EXISTS idx_history_year ON history(year)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_history_sort ON history(year, sort_order)');
  console.log('✅ 인덱스 생성 완료');

  // 기존 데이터 확인
  const existingHistory = db.prepare('SELECT COUNT(*) as count FROM history').all();
  console.log('현재 연혁 개수:', existingHistory[0].count);

  if (existingHistory[0].count === 0) {
    // 전체 연혁 데이터
    const historyData = [
      // 2008년
      { year: 2008, month: 10, date_text: '2008. 10', title: '지속가능한 친환경 서울대학교 선언 (18개 실천목표 발표)', sort_order: 1 },
      
      // 2009년
      { year: 2009, month: 2, date_text: '2009. 02', title: '지속가능한 친환경 서울대학교 추진 종합계획 수립 (92개 실천과제 수립)', sort_order: 1 },
      { year: 2009, month: 5, date_text: '2009. 05', title: 'ISO14001(환경경영시스템)인증', sort_order: 2 },
      { year: 2009, month: 5, date_text: '2009. 05', title: '대동제 그린캠페인 시작', sort_order: 3 },
      { year: 2009, month: 6, date_text: '2009. 06', title: '저탄소 친환경 모범대학 조성 협약식 (환경부)', sort_order: 4 },
      
      // 2010년
      { year: 2010, month: 5, date_text: '2010. 05', title: '그린리더십 교과과정 운영 협약식 (환경부-서울대-민간기업)', sort_order: 1 },
      { year: 2010, month: 5, date_text: '2010. 05', title: 'SNU 그린리더 선발 공모전 개최', sort_order: 2 },
      { year: 2010, month: 5, date_text: '2010. 05', title: 'ISO14001(환경경영시스템)사후 심사', sort_order: 3 },
      { year: 2010, month: 7, date_text: '2010. 07', title: '지속가능한 친환경 서울대학교 백서 발간', sort_order: 4 },
      { year: 2010, month: 11, date_text: '2010. 11', title: '온실가스 인벤토리구축 및 검인증 (자발적 인증)', sort_order: 5 },
      
      // 2011년
      { year: 2011, month: 1, date_text: '2011. 01', title: '온실가스▪에너지 목표관리 지정대학 협의회 창립 (의장교: 서울대학교)', sort_order: 1 },
      { year: 2011, month: 3, date_text: '2011. 03', title: '그린리더십 교과과정 개설', sort_order: 2 },
      { year: 2011, month: 5, date_text: '2011. 05', title: '2011 그린캠페인', sort_order: 3 },
      { year: 2011, month: 5, date_text: '2011. 05', title: '"온실가스ㆍ에너지감축전문위원회" 설립 및 운영개시', sort_order: 4 },
      { year: 2011, month: 6, date_text: '2011. 06', title: '(2007~2010) 온실가스 배출량 및 에너지사용량 명세서 제출', sort_order: 5 },
      { year: 2011, month: 11, date_text: '2011. 11', title: '학내 기관별 녹색생활담당자 교육 실시', sort_order: 6 },
      { year: 2011, month: 12, date_text: '2011. 12', title: '온실가스 에너지 감축 전문위원회 개최', sort_order: 7 },
      { year: 2011, month: 12, date_text: '2011. 12', title: '학내「온실가스ㆍ에너지목표관리운영규정」제정ㆍ공포', sort_order: 8 },
      
      // 2012년
      { year: 2012, month: 2, date_text: '2012. 02', title: 'Green-in-Us (그린캠퍼스 학생위원회) 2기 발족', sort_order: 1 },
      { year: 2012, month: 3, date_text: '2012. 03', title: '2011년 서울대학교 온실가스 배출량 산정 및 검증', sort_order: 2 },
      { year: 2012, month: 5, date_text: '2012. 05', title: '대학단위 온실가스 에너지 통합 관리 시스템 개발', sort_order: 3 },
      { year: 2012, month: 6, date_text: '2012. 06', title: '동경대학교 TSCP 교류 세미나', sort_order: 4 },
      { year: 2012, month: 8, date_text: '2012. 08', title: '그린리더십 인턴 프로그램 운영', sort_order: 5 },
      { year: 2012, month: 9, date_text: '2012. 09', title: '서울대학교 온실가스ㆍ에너지종합관리센터 설치', sort_order: 6 },
      { year: 2012, month: 12, date_text: '2012. 12', title: '온실가스 에너지 감축 전문위원회 개최', sort_order: 7 },
      
      // 2013년
      { year: 2013, month: 3, date_text: '2013. 03', title: '2012년 서울대학교 온실가스 배출량 산정 및 검증', sort_order: 1 },
      { year: 2013, month: 5, date_text: '2013. 05', title: '서울대학교 기후변화대응 이행계획서(SNU CAP)발간ㆍ배부', sort_order: 2 },
      { year: 2013, month: 6, date_text: '2013. 06', title: '서울대학교 관악캠퍼스 온실가스 맵 게시 (http://co2.snu.ac.kr)', sort_order: 3 },
      { year: 2013, month: 10, date_text: '2013. 10', title: '온실가스 에너지 감축 전문위원회 개최', sort_order: 4 },
      { year: 2013, month: 11, date_text: '2013. 11', title: '교직원 단기 연수 (일본 대학의 온실가스 에너지 관리 시스템 탐방)', sort_order: 5 },
      
      // 2014년
      { year: 2014, month: 1, date_text: '2014. 01', title: '서울대학교 자체 온실가스 배출시설 관리 프로그램 구축', sort_order: 1 },
      { year: 2014, month: 2, date_text: '2014. 02', title: '그린리더십 교과과정 수료 및 인증식', sort_order: 2 },
      { year: 2014, month: 3, date_text: '2014. 03', title: '그린캠페인 학생 활동 프로그램 근로봉사장학 프로그램 연계 시작', sort_order: 3 },
      { year: 2014, month: 3, date_text: '2014. 03', title: '온실가스 에너지 온라인 웹진 (인포그래픽) 발행 시작', sort_order: 4 },
      { year: 2014, month: 3, date_text: '2014. 03', title: '교내 주요 온실가스 배출 단과대학 대상 배출할당제 실시', sort_order: 5 },
      { year: 2014, month: 5, date_text: '2014. 05', title: '서울대학교 그린리포트(SNU Green Report) 발간ㆍ배부', sort_order: 6 },
      { year: 2014, month: 5, date_text: '2014. 05', title: '2014 그린캠페인', sort_order: 7 },
      { year: 2014, month: 8, date_text: '2014. 08', title: '그린리더십 인턴 프로그램 운영', sort_order: 8 },
      { year: 2014, month: 9, date_text: '2014. 09', title: 'CAS(Campus Sustainability) 네트워크 국제 세미나', sort_order: 9 },
      { year: 2014, month: 12, date_text: '2014. 12', title: '학내 \'온실가스 배출권거래제 이행관리 TFT\' 구성ㆍ운영 개시', sort_order: 10 },
      { year: 2014, month: 12, date_text: '2014. 12', title: '온실가스 에너지 감축 전문위원회 개최', sort_order: 11 },
      
      // 2015년 - 2024년 계속 추가...
      { year: 2015, month: 2, date_text: '2015. 02', title: '온실가스 배출시설 관리 프로그램 사용 교직원 세미나', sort_order: 1 },
      { year: 2015, month: 3, date_text: '2015. 03', title: '서울대학교 온실가스 에너지 감축 매뉴얼 제작', sort_order: 2 },
      { year: 2015, month: 5, date_text: '2015. 05', title: '2015 그린캠페인', sort_order: 3 },
      { year: 2015, month: 6, date_text: '2015. 06', title: '그린캠퍼스 학생 자율 활동 지원 사업 실시', sort_order: 4 },
      { year: 2015, month: 6, date_text: '2015. 06', title: '캠퍼스 마이크로그리드 구축 사업 개시', sort_order: 5 },
      { year: 2015, month: 8, date_text: '2015. 08', title: '사용자 참여형 에너지 절감 모바일 어플리케이션 개발', sort_order: 6 },
      { year: 2015, month: 9, date_text: '2015. 09', title: '에너지 사용정보 서브미터링 고도화 사업 시행', sort_order: 7 },
      { year: 2015, month: 12, date_text: '2015. 12', title: '온라인 소식지 20회 발행', sort_order: 8 },
      
      // 2020년대
      { year: 2020, month: 1, date_text: '2020. 01', title: '에너지 사용량 통보', sort_order: 1 },
      { year: 2020, month: 1, date_text: '2020. 01', title: '온라인 소식지 60회 발행', sort_order: 2 },
      { year: 2020, month: 3, date_text: '2020. 03', title: '페이스북 개설', sort_order: 3 },
      { year: 2020, month: 5, date_text: '2020. 05', title: 'ISO 14001 (환경경영시스템) 인증', sort_order: 4 },
      { year: 2020, month: 10, date_text: '2020. 10', title: '서울대학교 지속가능성 보고서 발간', sort_order: 5 },
      
      // 2021년
      { year: 2021, month: 5, date_text: '2021. 05', title: '지속가능성 학생 집담회 시작', sort_order: 1 },
      { year: 2021, month: 8, date_text: '2021. 08', title: '서울대학교 환경동아리 연합회의 출범', sort_order: 2 },
      { year: 2021, month: 9, date_text: '2021. 09', title: 'UN SDGs 관정관 전시회', sort_order: 3 },
      { year: 2021, month: 12, date_text: '2021. 12', title: '온실가스 인포그래픽 대형 전시회(220동, 75동)', sort_order: 4 },
      
      // 2022년
      { year: 2022, month: 2, date_text: '2022. 02', title: '온라인 소식지 80호 발행', sort_order: 1 },
      { year: 2022, month: 5, date_text: '2022. 05', title: '대동제 친환경 부스', sort_order: 2 },
      { year: 2022, month: 5, date_text: '2022. 05', title: '그린레포트 2021 발행', sort_order: 3 },
      { year: 2022, month: 6, date_text: '2022. 06', title: '가치소비, 같이나눔 프로젝트', sort_order: 4 },
      { year: 2022, month: 10, date_text: '2022. 10', title: '일회용기 없는 대학 축제', sort_order: 5 },
      { year: 2022, month: 12, date_text: '2022. 12', title: '친환경 학생활동 결과보고서 발간', sort_order: 6 },
      
      // 2023년
      { year: 2023, month: 4, date_text: '2023. 04', title: 'ESG보고서 발행', sort_order: 1 },
      { year: 2023, month: 5, date_text: '2023. 05', title: '일회용품 없는 대학 축제', sort_order: 2 },
      { year: 2023, month: 6, date_text: '2023. 06', title: '2022 그린레포트 발간', sort_order: 3 },
      { year: 2023, month: 6, date_text: '2023. 06', title: '전국대학 ESG 협의회', sort_order: 4 },
      { year: 2023, month: 10, date_text: '2023. 10', title: '미니멀 웨이스트 대학 축제', sort_order: 5 },
      { year: 2023, month: 12, date_text: '2023. 12', title: '국제 환경 대학생 포럼', sort_order: 6 },
      { year: 2023, month: 12, date_text: '2023. 12', title: '친환경 학생활동 결과보고서 발간', sort_order: 7 },
      
      // 2024년
      { year: 2024, month: 2, date_text: '2024. 02', title: '2022 ESG 보고서 발행', sort_order: 1 },
      { year: 2024, month: 2, date_text: '2024. 02', title: '2050 탄소중립 캠퍼스 기본구상', sort_order: 2 },
      { year: 2024, month: 2, date_text: '2024. 02', title: '온라인 소식지 100호 발행', sort_order: 3 },
      { year: 2024, month: 4, date_text: '2024. 04', title: '탄소중립 기획 과제 결과 공유회', sort_order: 4 },
      { year: 2024, month: 6, date_text: '2024. 06', title: '2023 그린레포트 발행', sort_order: 5 },
      { year: 2024, month: 9, date_text: '2024. 09', title: '다회용기 대학 축제', sort_order: 6 },
      { year: 2024, month: 11, date_text: '2024. 11', title: '지속가능한 캠퍼스 이니셔티브', sort_order: 7 },
      { year: 2024, month: 11, date_text: '2024. 11', title: '탄소중립 전환 포럼 학생 연대', sort_order: 8 }
    ];

    // 데이터 삽입
    const insertHistory = db.prepare(`
      INSERT INTO history (year, month, day, date_text, title, description, sort_order, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    for (const item of historyData) {
      insertHistory.run(
        item.year,
        item.month,
        item.day || null,
        item.date_text,
        item.title,
        item.description || null,
        item.sort_order
      );
    }

    console.log(`✅ ${historyData.length}개의 연혁 데이터 삽입 완료`);
  }

  // 결과 확인
  const allHistory = db.prepare('SELECT year, COUNT(*) as count FROM history GROUP BY year ORDER BY year DESC').all();
  console.log('📋 연도별 연혁 현황:');
  allHistory.forEach(item => {
    console.log(`  - ${item.year}년: ${item.count}개 항목`);
  });

  db.close();
  console.log('🎉 연혁 데이터 초기화 완료!');

} catch (error) {
  console.error('❌ 연혁 데이터 처리 오류:', error);
} 