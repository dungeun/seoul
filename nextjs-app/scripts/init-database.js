const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🚀 데이터베이스 초기화 시작...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정 (성능 향상)
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공');

  // 테이블 생성 SQL
  const createTablesSQL = [
    // 게시판 테이블
    `CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    )`,

    // 카테고리 테이블
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL
    )`,

    // 게시글 테이블
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT,
      excerpt TEXT,
      board_id INTEGER,
      category_id INTEGER,
      status TEXT DEFAULT 'published',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,

    // 메뉴 테이블
    `CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('page', 'board', 'link')),
      page_id INTEGER,
      board_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      content TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (page_id) REFERENCES posts(id) ON DELETE SET NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL
    )`,

    // 파일 테이블
    `CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    )`,

    // 히어로 슬라이드 테이블
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

    // 에너지 데이터 테이블
    `CREATE TABLE IF NOT EXISTS energy_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      electricity_kwh REAL DEFAULT 0,
      gas_m3 REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,

    // 태양광 데이터 테이블
    `CREATE TABLE IF NOT EXISTS solar_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      generation_kwh REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,

    // 온실가스 데이터 테이블
    `CREATE TABLE IF NOT EXISTS greenhouse_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building_name TEXT NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      scope1_emission REAL DEFAULT 0,
      scope2_emission REAL DEFAULT 0,
      total_emission REAL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  ];

  // 테이블 생성 실행
  console.log('📋 테이블 생성 중...');
  for (const sql of createTablesSQL) {
    db.exec(sql);
  }
  
  console.log('✅ 모든 테이블 생성 완료');

  // 샘플 데이터 삽입
  console.log('📝 샘플 데이터 삽입 중...');

  // 현재 시간 생성
  const now = new Date().toISOString();

  // 기본 게시판 생성
  const insertBoard = db.prepare('INSERT OR IGNORE INTO boards (name, slug, description, created_at) VALUES (?, ?, ?, ?)');
  insertBoard.run('공지사항', 'notice', '중요한 공지사항을 게시합니다', now);
  insertBoard.run('일반게시판', 'general', '일반적인 게시글을 올리는 공간입니다', now);

  // 기본 카테고리 생성
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name, slug, description, created_at) VALUES (?, ?, ?, ?)');
  insertCategory.run('탄소중립', 'carbon-neutral', '탄소중립 관련 내용', now);
  insertCategory.run('에너지', 'energy', '에너지 관련 내용', now);
  insertCategory.run('환경', 'environment', '환경 관련 내용', now);

  // 기본 히어로 슬라이드 생성
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

  // 기본 메뉴 생성
  const insertMenu = db.prepare(`
    INSERT OR IGNORE INTO menus 
    (name, url, type, page_id, board_id, sort_order, is_active, content, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertMenu.run('홈', '/', 'page', null, null, 1, 1, null, now);
  insertMenu.run('온실가스', '/greenhouse-gas', 'page', null, null, 2, 1, null, now);
  insertMenu.run('에너지', '/energy', 'page', null, null, 3, 1, null, now);
  insertMenu.run('태양광 발전', '/solar-power', 'page', null, null, 4, 1, null, now);

  console.log('✅ 샘플 데이터 삽입 완료');

  // 인덱스 생성 (성능 최적화)
  console.log('🔍 인덱스 생성 중...');
  const createIndexes = [
    'CREATE INDEX IF NOT EXISTS idx_posts_board_id ON posts(board_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(category_id)',
    'CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status)',
    'CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order)',
    'CREATE INDEX IF NOT EXISTS idx_menus_is_active ON menus(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_energy_data_year_month ON energy_data(year, month)',
    'CREATE INDEX IF NOT EXISTS idx_solar_data_year_month ON solar_data(year, month)',
    'CREATE INDEX IF NOT EXISTS idx_greenhouse_data_year_month ON greenhouse_data(year, month)'
  ];

  for (const indexSQL of createIndexes) {
    db.exec(indexSQL);
  }

  console.log('✅ 인덱스 생성 완료');

  db.close();
  console.log('🎉 데이터베이스 초기화 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 초기화 실패:', error);
  process.exit(1);
}