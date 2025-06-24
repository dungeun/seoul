#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updatePosts() {
  const client = await pool.connect();
  
  try {
    // 이미지 썸네일로 업데이트 (PDF 대신)
    const updates = [
      {
        id: 8,
        featured_image: '/img/2024.jpg',
        attachment_filename: '2024_탄소중립_실천가이드.pdf'
      },
      {
        id: 9,
        featured_image: '/img/2023.jpg',
        attachment_filename: '그린캠퍼스_조성계획서_2024-2028.pdf'
      },
      {
        id: 10,
        featured_image: '/img/2022.jpg',
        attachment_filename: '재생에너지_도입현황_2024.xlsx'
      },
      {
        id: 11,
        featured_image: '/img/2021.jpg',
        attachment_filename: '탄소배출_감축방안_연구보고서.pdf'
      },
      {
        id: 12,
        featured_image: '/img/2020.jpg',
        attachment_filename: '친환경건물_인증가이드라인_v2.pdf'
      },
      {
        id: 13,
        featured_image: '/img/2019.jpg',
        attachment_filename: '폐기물_재활용실적_2023.pdf'
      },
      {
        id: 14,
        featured_image: '/img/2018.jpg',
        attachment_filename: '에너지절약_캠페인결과_2024.docx'
      },
      {
        id: 15,
        featured_image: '/img/2017.jpg',
        attachment_filename: '탄소중립_교육프로그램_매뉴얼.pdf'
      }
    ];
    
    for (const update of updates) {
      await client.query(
        `UPDATE posts 
         SET featured_image = $1, 
             attachment_filepath = $2,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [update.featured_image, update.featured_image, update.id]
      );
      console.log(`✅ 업데이트됨: Post ID ${update.id}`);
    }
    
    console.log('\n✅ 모든 게시물이 업데이트되었습니다.');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePosts();