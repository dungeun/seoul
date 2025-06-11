const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🔄 메뉴 테이블 업데이트 시작...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  console.log('✅ 데이터베이스 연결 성공');

  // 기존 메뉴 데이터 백업
  console.log('💾 기존 메뉴 데이터 백업 중...');
  let existingMenus = [];
  try {
    existingMenus = db.prepare('SELECT * FROM menus').all();
    console.log(`📋 기존 메뉴 ${existingMenus.length}개 백업 완료`);
  } catch (error) {
    console.log('⚠️ 기존 메뉴 테이블이 없습니다. 새로 생성합니다.');
  }

  // 기존 테이블 삭제
  console.log('🗑️ 기존 메뉴 테이블 삭제 중...');
  db.exec('DROP TABLE IF EXISTS menus');

  // 새로운 메뉴 테이블 생성
  console.log('🏗️ 새로운 메뉴 테이블 생성 중...');
  db.exec(`
    CREATE TABLE menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('page', 'board', 'link')),
      page_id INTEGER,
      board_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (page_id) REFERENCES posts(id) ON DELETE SET NULL,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL
    )
  `);

  // 인덱스 생성
  console.log('🔍 인덱스 생성 중...');
  db.exec('CREATE INDEX idx_menus_sort_order ON menus(sort_order)');
  db.exec('CREATE INDEX idx_menus_is_active ON menus(is_active)');

  // 기본 메뉴 데이터 삽입
  console.log('📝 기본 메뉴 데이터 삽입 중...');
  const now = new Date().toISOString();
  
  const insertMenu = db.prepare(`
    INSERT INTO menus (name, url, type, page_id, board_id, sort_order, is_active, content, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const defaultMenus = [
    { name: '온실가스', url: '/greenhouse-gas', type: 'page', sort_order: 1 },
    { name: '에너지', url: '/energy', type: 'page', sort_order: 2 },
    { name: '태양광 발전', url: '/solar-power', type: 'page', sort_order: 3 },
    { name: '인포그래픽', url: '/infographic', type: 'page', sort_order: 4 },
    { name: 'GitHub', url: 'https://github.com/seoul-carbon-neutral', type: 'link', sort_order: 5 }
  ];

  for (const menu of defaultMenus) {
    insertMenu.run(
      menu.name, 
      menu.url, 
      menu.type, 
      null, // page_id
      null, // board_id
      menu.sort_order, 
      1, // is_active
      null, // content
      now
    );
  }

  // 결과 확인
  const allMenus = db.prepare('SELECT * FROM menus ORDER BY sort_order').all();
  console.log('📋 현재 메뉴 목록:');
  allMenus.forEach(menu => {
    console.log(`  - ${menu.name} (${menu.url}) - ${menu.is_active ? '활성' : '비활성'}`);
  });

  db.close();
  console.log('✅ 메뉴 테이블 업데이트 완료!');

} catch (error) {
  console.error('❌ 메뉴 테이블 업데이트 실패:', error);
  process.exit(1);
} 