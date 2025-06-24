const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function initMainIcons() {
  try {
    // 테이블 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS main_page_icons (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        url VARCHAR(500) NOT NULL,
        icon_image VARCHAR(500) NOT NULL,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ main_page_icons 테이블 생성 완료');

    // 업데이트 트리거 함수 생성
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 트리거 생성
    await pool.query(`
      DROP TRIGGER IF EXISTS update_main_page_icons_updated_at ON main_page_icons;
      CREATE TRIGGER update_main_page_icons_updated_at 
      BEFORE UPDATE ON main_page_icons 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ 업데이트 트리거 생성 완료');

    // 기존 데이터 확인
    const { rows } = await pool.query('SELECT COUNT(*) FROM main_page_icons');
    
    if (rows[0].count === '0') {
      // 초기 데이터 삽입
      const initialData = [
        ['온실가스 배출량', '/greenhouse-gas', '/img/icons/greenhouse-gas.png', 1],
        ['온실가스 감축활동', '/greenhouse-reduction', '/img/icons/greenhouse-reduction.png', 2],
        ['온실가스 맵', '/greenhouse-map', '/img/icons/greenhouse-map.png', 3],
        ['에너지', '/energy', '/img/icons/energy.png', 4],
        ['태양광 발전', '/solar-power', '/img/icons/solar-power.png', 5],
        ['전력사용량', '/electricity-usage', '/img/icons/electricity-usage.png', 6],
        ['친환경 학생 활동', '/eco-student', '/img/icons/eco-student.png', 7],
        ['그린리더십', '/green-leadership', '/img/icons/green-leadership.png', 8],
        ['그린레포트', '/green-report', '/img/icons/green-report.png', 9],
        ['인포그래픽', '/infographic', '/img/icons/infographic.png', 10],
        ['자료실', '/archive', '/img/icons/archive.png', 11],
        ['지속가능성 보고서', '/sustainability-report', '/img/icons/sustainability-report.png', 12]
      ];

      for (const [title, url, icon_image, order_index] of initialData) {
        await pool.query(
          'INSERT INTO main_page_icons (title, url, icon_image, order_index) VALUES ($1, $2, $3, $4)',
          [title, url, icon_image, order_index]
        );
      }

      console.log('✅ 초기 데이터 삽입 완료');
    } else {
      console.log('ℹ️ 이미 데이터가 존재합니다');
    }

    console.log('🎉 main_page_icons 테이블 초기화 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await pool.end();
  }
}

initMainIcons();