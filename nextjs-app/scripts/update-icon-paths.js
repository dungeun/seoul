const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function updateIconPaths() {
  try {
    // 실제 이미지 파일과 매핑
    const iconMappings = [
      { title: '온실가스 배출량', image: '/img/1.png' },
      { title: '온실가스 감축활동', image: '/img/2.png' },
      { title: '온실가스 맵', image: '/img/3.png' },
      { title: '에너지', image: '/img/4.png' },
      { title: '태양광 발전', image: '/img/5.png' },
      { title: '전력사용량', image: '/img/6.png' },
      { title: '친환경 학생 활동', image: '/img/8.png' }, // 7.png 대신 8.png 사용
      { title: '그린리더십', image: '/img/9.png' },
      { title: '그린레포트', image: '/img/10.png' },
      { title: '인포그래픽', image: '/img/11.png' },
      { title: '자료실', image: '/img/12.png' },
      { title: '지속가능성 보고서', image: '/img/1.png' } // 1.png 재사용
    ];

    for (const mapping of iconMappings) {
      const result = await pool.query(
        'UPDATE main_page_icons SET icon_image = $1 WHERE title = $2',
        [mapping.image, mapping.title]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ "${mapping.title}" 아이콘 경로 업데이트: ${mapping.image}`);
      } else {
        console.log(`⚠️ "${mapping.title}" 아이콘을 찾을 수 없습니다`);
      }
    }

    console.log('\n🎉 모든 아이콘 경로 업데이트 완료!');
    
    // 업데이트된 데이터 확인
    const { rows } = await pool.query('SELECT title, icon_image FROM main_page_icons ORDER BY order_index');
    console.log('\n📋 현재 아이콘 경로:');
    rows.forEach(row => {
      console.log(`  - ${row.title}: ${row.icon_image}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

updateIconPaths();