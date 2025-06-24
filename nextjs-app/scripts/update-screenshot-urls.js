const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 스크린샷 생성 로그에서 URL 매핑 정보 읽기
async function readScreenshotMapping() {
  try {
    const logFile = path.join(__dirname, 'screenshot-generation.log');
    const logContent = await fs.readFile(logFile, 'utf-8');
    const lines = logContent.split('\n');
    
    const mapping = {};
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // 성공한 스크린샷 찾기
      if (line.includes('✓ Screenshot saved:')) {
        const filenameMatch = line.match(/screenshot-[\d]+-[\w]+\.jpg/);
        if (filenameMatch) {
          const filename = filenameMatch[0];
          
          // 이전 라인들에서 URL 찾기
          for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
            if (lines[j].includes('Navigating to:')) {
              const urlMatch = lines[j].match(/Navigating to: (.+)/);
              if (urlMatch) {
                const url = urlMatch[1].trim();
                mapping[url] = `/uploads/screenshots/${filename}`;
                console.log(`매핑 발견: ${url} -> ${filename}`);
                break;
              }
            }
          }
        }
      }
    }
    
    return mapping;
  } catch (error) {
    console.error('로그 파일 읽기 실패:', error);
    return {};
  }
}

async function updateScreenshots() {
  const client = await pool.connect();
  
  try {
    console.log('=== 스크린샷 URL 업데이트 시작 ===\n');
    
    // 스크린샷 매핑 읽기
    const mapping = await readScreenshotMapping();
    console.log(`\n총 ${Object.keys(mapping).length}개의 매핑 발견\n`);
    
    // 모든 posts 가져오기
    const postsResult = await client.query(`
      SELECT id, name, url, screenshot_url 
      FROM carbon_tech_posts 
      ORDER BY id
    `);
    
    let updateCount = 0;
    let alreadyHasCount = 0;
    
    for (const post of postsResult.rows) {
      if (mapping[post.url]) {
        if (!post.screenshot_url) {
          // 스크린샷 URL 업데이트
          await client.query(
            'UPDATE carbon_tech_posts SET screenshot_url = $1 WHERE id = $2',
            [mapping[post.url], post.id]
          );
          console.log(`✓ 업데이트: ${post.name} - ${mapping[post.url]}`);
          updateCount++;
        } else {
          alreadyHasCount++;
        }
      }
    }
    
    console.log(`\n=== 업데이트 완료 ===`);
    console.log(`업데이트된 레코드: ${updateCount}개`);
    console.log(`이미 스크린샷이 있는 레코드: ${alreadyHasCount}개`);
    
    // 수소 분야 확인
    const hydrogenResult = await client.query(`
      SELECT name, screenshot_url 
      FROM carbon_tech_posts 
      WHERE sub_category = '수소 분야 (생산, 운반, 저장 등)'
      ORDER BY name
    `);
    
    console.log(`\n=== 수소 분야 스크린샷 상태 ===`);
    hydrogenResult.rows.forEach(row => {
      console.log(`${row.name}: ${row.screenshot_url ? '있음' : '없음'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateScreenshots();