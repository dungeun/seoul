const Database = require('better-sqlite3');
const path = require('path');

// 데이터베이스 경로
const dbPath = path.join(__dirname, '..', '..', 'server', 'database.db');

console.log('🚀 posts 테이블 업데이트 중...');
console.log('📍 DB 경로:', dbPath);

try {
  const db = new Database(dbPath);
  
  // WAL 모드 설정
  db.pragma('journal_mode = WAL');
  
  console.log('✅ 데이터베이스 연결 성공');

  // 컬럼 추가
  console.log('📋 컬럼 추가 중...');
  
  // featured_image 컬럼 추가
  try {
    db.exec('ALTER TABLE posts ADD COLUMN featured_image TEXT');
    console.log('✅ featured_image 컬럼 추가 완료');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ featured_image 컬럼이 이미 존재합니다');
    } else {
      throw error;
    }
  }

  // view_count 컬럼 추가
  try {
    db.exec('ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0');
    console.log('✅ view_count 컬럼 추가 완료');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✅ view_count 컬럼이 이미 존재합니다');
    } else {
      throw error;
    }
  }

  // 인덱스 생성
  console.log('🔍 인덱스 생성 중...');
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC)');
    console.log('✅ 인덱스 생성 완료');
  } catch (error) {
    console.warn('⚠️ 인덱스 생성 중 오류:', error.message);
  }

  db.close();
  console.log('🎉 posts 테이블 업데이트 완료!');

} catch (error) {
  console.error('❌ 데이터베이스 업데이트 실패:', error);
  process.exit(1);
}