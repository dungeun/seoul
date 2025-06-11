const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);

  // 테스트용 게시판 생성
  const insertBoard = db.prepare('INSERT OR IGNORE INTO boards (name, slug, description, created_at) VALUES (?, ?, ?, datetime(\'now\'))');
  insertBoard.run('친환경 활동 연혁', 'green-activity', '친환경 활동과 관련된 게시판입니다');

  // 결과 확인
  const boards = db.prepare('SELECT * FROM boards').all();
  console.log('📋 현재 게시판 목록:');
  boards.forEach(board => {
    console.log(`  - ${board.name} (${board.slug})`);
    console.log(`    URL: /board/${board.slug}`);
  });

  db.close();
  console.log('✅ 테스트 게시판 생성 완료!');
} catch (error) {
  console.error('❌ 오류:', error);
} 