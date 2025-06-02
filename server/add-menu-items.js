import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const addMenuItems = () => {
  console.log('📋 온실가스/에너지 메뉴 추가 시작...');

  db.serialize(() => {
    // 온실가스 페이지 추가
    db.run(
      `INSERT OR REPLACE INTO pages (title, slug, content) VALUES (?, ?, ?)`,
      [
        '온실가스 통계',
        'greenhouse-gas',
        `<h1>🌱 온실가스 배출량 통계</h1>
         <p>서울대학교 캠퍼스의 온실가스 배출량을 실시간으로 모니터링하고 탄소중립 목표 달성 과정을 추적합니다.</p>
         <div id="greenhouse-gas-charts"></div>`
      ],
      function(err) {
        if (err) {
          console.error('온실가스 페이지 생성 오류:', err);
          return;
        }

        const pageId = this.lastID;
        console.log('✅ 온실가스 페이지 생성 완료, ID:', pageId);

        // 온실가스 메뉴 추가
        db.run(
          `INSERT OR REPLACE INTO menus (name, url, type, page_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
          ['온실가스 통계', '/greenhouse-gas', 'page', pageId, 10, 1],
          function(err) {
            if (err) {
              console.error('온실가스 메뉴 생성 오류:', err);
            } else {
              console.log('✅ 온실가스 메뉴 생성 완료');
            }
          }
        );
      }
    );

    // 에너지 페이지 추가
    db.run(
      `INSERT OR REPLACE INTO pages (title, slug, content) VALUES (?, ?, ?)`,
      [
        '에너지 통계',
        'energy',
        `<h1>⚡ 에너지 사용량 통계</h1>
         <p>서울대학교 캠퍼스의 전기, 가스, 태양광 등 에너지 사용량을 실시간으로 모니터링하고 효율성을 분석합니다.</p>
         <div id="energy-charts"></div>`
      ],
      function(err) {
        if (err) {
          console.error('에너지 페이지 생성 오류:', err);
          return;
        }

        const pageId = this.lastID;
        console.log('✅ 에너지 페이지 생성 완료, ID:', pageId);

        // 에너지 메뉴 추가
        db.run(
          `INSERT OR REPLACE INTO menus (name, url, type, page_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)`,
          ['에너지 통계', '/energy', 'page', pageId, 11, 1],
          function(err) {
            if (err) {
              console.error('에너지 메뉴 생성 오류:', err);
            } else {
              console.log('✅ 에너지 메뉴 생성 완료');
            }
          }
        );
      }
    );

    // 메인 홈페이지 메뉴 추가
    db.run(
      `INSERT OR REPLACE INTO menus (name, url, type, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`,
      ['홈', '/', 'page', 1, 1],
      function(err) {
        if (err) {
          console.error('홈 메뉴 생성 오류:', err);
        } else {
          console.log('✅ 홈 메뉴 생성 완료');
        }
      }
    );

    console.log('✅ 모든 메뉴 추가 완료!');
  });
};

// 실행
addMenuItems();

setTimeout(() => {
  db.close();
  console.log('🎉 메뉴 설정 완료!');
}, 1000); 