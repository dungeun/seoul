const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function clearLinkPosts() {
  const client = await pool.connect();
  
  try {
    // 먼저 현재 데이터 확인
    const countBefore = await client.query('SELECT COUNT(*) FROM link_posts');
    console.log(`\n📊 현재 link_posts 테이블에 ${countBefore.rows[0].count}개의 레코드가 있습니다.`);
    
    const confirm = process.argv[2];
    if (confirm !== '--confirm') {
      console.log('\n⚠️  경고: 이 작업은 모든 link_posts 데이터를 삭제합니다!');
      console.log('실행하려면 다음 명령어를 사용하세요:');
      console.log('node scripts/clear-link-posts.js --confirm\n');
      return;
    }
    
    console.log('\n🗑️  link_posts 테이블 데이터 삭제 중...');
    
    // 데이터 삭제
    await client.query('DELETE FROM link_posts');
    
    // ID 시퀀스 리셋 (옵션)
    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('link_posts', 'id'),
        1,
        false
      )
    `);
    
    console.log('✅ link_posts 테이블이 성공적으로 비워졌습니다.');
    console.log('✅ ID 시퀀스가 리셋되었습니다.\n');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearLinkPosts().catch(console.error);