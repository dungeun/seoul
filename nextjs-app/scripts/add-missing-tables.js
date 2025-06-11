const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🚀 누락된 테이블 추가 중...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정 (성능 향상)
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공');

  // 기존 테이블 확인 및 누락된 테이블 생성
  const addMissingTablesSQL = [
    // 히어로 슬라이드 테이블 (존재하지 않으면 생성)
    `CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      description TEXT NOT NULL,
      button_text TEXT NOT NULL,
      background_color TEXT,
      background_image TEXT,
      text_color TEXT DEFAULT 'white',
      order_index INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at TEXT NOT NULL
    )`,

    // 에너지 데이터 테이블 (이미 있을 수 있음)
    `CREATE TABLE IF NOT EXISTS energy_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      electricity_kwh REAL DEFAULT 0,
      gas_m3 REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // 태양광 데이터 테이블
    `CREATE TABLE IF NOT EXISTS solar_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      generation_kwh REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  // categories 테이블에 slug 컬럼 추가 (없으면)
  console.log('📋 카테고리 테이블 업데이트 중...');
  try {
    db.exec('ALTER TABLE categories ADD COLUMN slug TEXT');
    console.log('✅ categories 테이블에 slug 컬럼 추가');
    
    // 기존 카테고리들에 slug 생성
    const categories = db.prepare('SELECT id, name FROM categories WHERE slug IS NULL').all();
    const updateSlug = db.prepare('UPDATE categories SET slug = ? WHERE id = ?');
    
    for (const category of categories) {
      const slug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      updateSlug.run(slug, category.id);
    }
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ categories 테이블에 slug 컬럼이 이미 존재합니다');
    } else {
      console.warn('⚠️ categories 테이블 업데이트 중 오류:', error.message);
    }
  }

  // 누락된 테이블 생성
  console.log('📋 누락된 테이블 생성 중...');
  for (const sql of addMissingTablesSQL) {
    db.exec(sql);
  }
  
  console.log('✅ 누락된 테이블 생성 완료');

  // 샘플 데이터 삽입 (히어로 슬라이드)
  console.log('📝 기본 히어로 슬라이드 삽입 중...');
  const now = new Date().toISOString();

  const insertHeroSlide = db.prepare(`
    INSERT OR IGNORE INTO hero_slides 
    (title, subtitle, description, button_text, background_color, text_color, order_index, is_active, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertHeroSlide.run(
    '서울대학교 탄소중립캠퍼스',
    'Carbon Neutral Campus Initiative',
    '2050 탄소중립을 향한 지속가능한 미래를 만들어갑니다',
    '자세히 보기',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'white',
    1,
    1,
    now
  );

  insertHeroSlide.run(
    '그린에너지 혁신',
    'Green Energy Innovation',
    '태양광, 풍력 등 재생에너지로 캠퍼스를 운영합니다',
    '에너지 현황',
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    'white',
    2,
    1,
    now
  );

  console.log('✅ 기본 데이터 삽입 완료');

  // 인덱스 생성 (성능 최적화)
  console.log('🔍 인덱스 생성 중...');
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_energy_data_year_month ON energy_data(year, month)',
    'CREATE INDEX IF NOT EXISTS idx_solar_data_year_month ON solar_data(year, month)'
  ];

  for (const indexSQL of createIndexes) {
    try {
      db.exec(indexSQL);
    } catch (error) {
      console.warn('⚠️ 인덱스 생성 중 오류 (이미 존재할 수 있음):', error.message);
    }
  }

  console.log('✅ 인덱스 생성 완료');

  db.close();
  console.log('🎉 데이터베이스 업데이트 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 업데이트 실패:', error);
  process.exit(1);
}