const { dbQuery } = require('../lib/database.js');

console.log('🗄️ DB 연결 테스트...');

// menus 테이블 생성
try {
  dbQuery.run(`
    CREATE TABLE IF NOT EXISTS menus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('page', 'board', 'link')),
      page_id INTEGER NULL,
      board_id INTEGER NULL,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      content TEXT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ menus 테이블 생성 완료');

  // 기존 데이터 확인
  const existingMenus = dbQuery.all('SELECT COUNT(*) as count FROM menus');
  console.log('현재 메뉴 개수:', existingMenus[0].count);

  if (existingMenus[0].count === 0) {
    // 초기 메뉴 데이터 입력
    const menus = [
      { name: '온실가스', url: '/greenhouse-gas', type: 'page', sort_order: 1 },
      { name: '에너지', url: '/energy', type: 'page', sort_order: 2 },
      { name: '태양광 발전', url: '/solar-power', type: 'page', sort_order: 3 },
      { name: '인포그래픽', url: '/infographic', type: 'page', sort_order: 4 },
      { name: 'GitHub', url: 'https://github.com/seoul-carbon-neutral', type: 'link', sort_order: 5 }
    ];

    for (const menu of menus) {
      dbQuery.run(
        'INSERT INTO menus (name, url, type, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, 1, datetime("now"))',
        [menu.name, menu.url, menu.type, menu.sort_order]
      );
    }
    console.log('✅ 초기 메뉴 데이터 입력 완료');
  }

  // 결과 확인
  const allMenus = dbQuery.all('SELECT * FROM menus ORDER BY sort_order');
  console.log('📋 현재 메뉴 목록:');
  allMenus.forEach(menu => {
    console.log(`  - ${menu.name} (${menu.url}) - ${menu.is_active ? '활성' : '비활성'}`);
  });

} catch (error) {
  console.error('❌ DB 오류:', error);
} 