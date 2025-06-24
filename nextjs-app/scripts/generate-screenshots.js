#!/usr/bin/env node

const { Pool } = require('pg');
// fetch는 Node.js 18 이상에서 기본 제공
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// API URL 설정
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008';

async function generateScreenshots() {
  console.log('🖼️  스크린샷 생성 시작...\n');
  
  const client = await pool.connect();
  
  try {
    // 스크린샷이 없는 링크 조회
    const links = await client.query(`
      SELECT id, link_url, title 
      FROM link_posts 
      WHERE image_url IS NULL OR image_url = ''
      ORDER BY id
    `);
    
    console.log(`총 ${links.rows.length}개의 스크린샷을 생성합니다.\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 배치 처리 (동시에 1개씩 - 안정성 향상)
    const batchSize = 1;
    for (let i = 0; i < links.rows.length; i += batchSize) {
      const batch = links.rows.slice(i, i + batchSize);
      
      const promises = batch.map(async (link) => {
        try {
          console.log(`📸 스크린샷 생성 중: ${link.title}`);
          
          // 스크린샷 API 호출
          const response = await fetch(`${API_URL}/api/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: link.link_url })
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // DB 업데이트
            await client.query(
              'UPDATE link_posts SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [data.screenshot_url, link.id]
            );
            
            successCount++;
            console.log(`✅ 완료: ${link.title}`);
          } else {
            throw new Error(`API 응답 오류: ${response.status}`);
          }
        } catch (error) {
          failCount++;
          console.error(`❌ 실패: ${link.title} - ${error.message}`);
        }
      });
      
      // 배치 완료 대기
      await Promise.allSettled(promises);
      
      console.log(`\n진행률: ${Math.min(i + batchSize, links.rows.length)}/${links.rows.length}`);
      
      // 서버 부하 방지를 위한 대기 (시간 증가)
      if (i + batchSize < links.rows.length) {
        console.log('잠시 대기 중...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('\n📊 스크린샷 생성 완료!');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
    
  } catch (error) {
    console.error('❌ 스크린샷 생성 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 실행
generateScreenshots().catch(console.error);