const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🚀 boards 테이블 업데이트 중...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공');

  // type 컬럼 추가
  console.log('📋 컬럼 추가 중...');
  
  try {
    db.exec('ALTER TABLE boards ADD COLUMN type TEXT DEFAULT "list"');
    console.log('✅ type 컬럼 추가 완료');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ type 컬럼이 이미 존재합니다');
    } else {
      throw error;
    }
  }

  // 기존 게시판들을 갤러리 타입으로 업데이트 (선택사항)
  console.log('📝 기본값 설정 중...');
  const stmt = db.prepare('UPDATE boards SET type = ? WHERE slug = ?');
  stmt.run('gallery', 'green-activity');
  console.log('✅ green-activity 게시판을 갤러리 타입으로 설정');

  db.close();
  console.log('🎉 boards 테이블 업데이트 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 업데이트 실패:', error);
  process.exit(1);
}