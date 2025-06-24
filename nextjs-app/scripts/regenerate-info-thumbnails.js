const { Pool } = require('pg');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function regenerateThumbnails() {
  try {
    // info 게시판 찾기
    const boardResult = await pool.query("SELECT id FROM boards WHERE slug = 'info'");
    if (boardResult.rows.length === 0) {
      console.log('info 게시판을 찾을 수 없습니다');
      return;
    }
    
    const boardId = boardResult.rows[0].id;
    
    // info 게시판의 모든 게시물 가져오기
    const posts = await pool.query(
      'SELECT id, title, featured_image, thumbnail_url FROM posts WHERE board_id = $1',
      [boardId]
    );
    
    console.log(`총 ${posts.rows.length}개의 게시물에 대해 썸네일 재생성을 시작합니다.`);
    
    for (const post of posts.rows) {
      if (!post.featured_image) {
        console.log(`게시물 ${post.id}: 이미지가 없습니다. 건너뜁니다.`);
        continue;
      }
      
      try {
        // 원본 이미지 경로
        const imagePath = path.join(process.cwd(), 'public', post.featured_image);
        
        // 파일 존재 확인
        try {
          await fs.access(imagePath);
        } catch {
          console.log(`게시물 ${post.id}: 이미지 파일을 찾을 수 없습니다: ${imagePath}`);
          continue;
        }
        
        // 썸네일 파일명 생성
        const originalFileName = path.basename(post.featured_image);
        const thumbFileName = `thumb_${originalFileName}`;
        const thumbPath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', thumbFileName);
        
        // 300x400 크롭 썸네일 생성 - 흰색 배경 추가
        await sharp(imagePath)
          .resize(300, 400, {
            fit: 'cover',
            position: 'top' // 상단 기준 크롭
          })
          .flatten({ background: { r: 255, g: 255, b: 255 } }) // 흰색 배경 추가
          .jpeg({ quality: 85 })
          .toFile(thumbPath);
        
        // DB 업데이트
        const thumbUrl = `/uploads/thumbnails/${thumbFileName}`;
        await pool.query(
          'UPDATE posts SET thumbnail_url = $1 WHERE id = $2',
          [thumbUrl, post.id]
        );
        
        console.log(`게시물 ${post.id}: 썸네일 재생성 완료 - ${thumbUrl}`);
      } catch (error) {
        console.error(`게시물 ${post.id}: 썸네일 생성 실패:`, error.message);
      }
    }
    
    console.log('\n썸네일 재생성이 완료되었습니다!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

regenerateThumbnails();