require('dotenv').config({ path: '.env.local' });
const sharp = require('sharp');
const { neon } = require('@neondatabase/serverless');
const fs = require('fs').promises;
const path = require('path');

async function regenerateAllThumbnails() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 모든 게시물의 썸네일을 재생성합니다...');
    
    // 모든 게시물 조회
    const posts = await sql`
      SELECT id, title, featured_image, thumbnail_url, board_id
      FROM posts
      WHERE featured_image IS NOT NULL
      ORDER BY id DESC
    `;
    
    console.log(`📊 총 ${posts.length}개의 게시물을 찾았습니다.`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const post of posts) {
      try {
        // 원본 이미지 경로
        const originalPath = path.join(process.cwd(), 'public', post.featured_image);
        
        // 파일 존재 확인
        try {
          await fs.access(originalPath);
        } catch {
          console.log(`❌ 파일을 찾을 수 없습니다: ${post.featured_image}`);
          failCount++;
          continue;
        }
        
        // 썸네일 파일명 생성
        const ext = path.extname(post.featured_image);
        const basename = path.basename(post.featured_image, ext);
        const thumbnailFilename = `thumb_${basename}.jpg`; // 모든 썸네일을 JPG로 생성
        const thumbnailPath = path.join(process.cwd(), 'public', 'uploads', 'thumbnails', thumbnailFilename);
        const thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
        
        // 게시판 타입 확인 (info 게시판은 300x400, 나머지는 300x300)
        const boardResult = await sql`
          SELECT slug FROM boards WHERE id = ${post.board_id}
        `;
        const isInfoBoard = boardResult[0]?.slug === 'info';
        
        // 썸네일 생성
        if (isInfoBoard) {
          // info 게시판용 썸네일 (300x400, 상단 기준)
          await sharp(originalPath)
            .resize(300, 400, {
              fit: 'cover',
              position: 'top'
            })
            .jpeg({ quality: 85 })
            .toFile(thumbnailPath);
        } else {
          // 일반 썸네일 (300x300, 중앙 기준)
          await sharp(originalPath)
            .resize(300, 300, {
              fit: 'cover',
              position: 'center'
            })
            .jpeg({ quality: 85 })
            .toFile(thumbnailPath);
        }
        
        // DB 업데이트
        await sql`
          UPDATE posts 
          SET thumbnail_url = ${thumbnailUrl}
          WHERE id = ${post.id}
        `;
        
        console.log(`✅ 썸네일 생성 완료 - Post ID: ${post.id}, ${isInfoBoard ? 'Info Board (300x400)' : 'General (300x300)'}`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ 썸네일 생성 실패 - Post ID: ${post.id}:`, error.message);
        failCount++;
      }
    }
    
    console.log('\n📊 작업 완료:');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${failCount}개`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
regenerateAllThumbnails();