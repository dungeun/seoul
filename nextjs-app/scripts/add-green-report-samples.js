#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addSamplePosts() {
  const client = await pool.connect();
  
  try {
    // Get green-report board ID
    const boardResult = await client.query(
      "SELECT id FROM boards WHERE slug = 'green-report'"
    );
    
    if (boardResult.rows.length === 0) {
      console.error('green-report 게시판을 찾을 수 없습니다.');
      return;
    }
    
    const boardId = boardResult.rows[0].id;
    console.log(`green-report 게시판 ID: ${boardId}`);
    
    // Sample posts with attachments
    const samplePosts = [
      {
        title: '2024년 탄소중립 실천 가이드북',
        content: '서울대학교 구성원들을 위한 탄소중립 실천 가이드북입니다. 일상생활에서 실천할 수 있는 다양한 방법들을 소개합니다.',
        excerpt: '탄소중립 실천 가이드북',
        attachment_filename: '2024_탄소중립_실천가이드.pdf',
        attachment_filepath: '/uploads/2024_carbon_neutral_guide.pdf',
        attachment_filesize: 2548763
      },
      {
        title: '그린캠퍼스 조성 계획서 (2024-2028)',
        content: '서울대학교 그린캠퍼스 중장기 조성 계획서입니다. 향후 5년간의 탄소중립 캠퍼스 구축 로드맵을 담고 있습니다.',
        excerpt: '그린캠퍼스 중장기 계획',
        attachment_filename: '그린캠퍼스_조성계획서_2024-2028.pdf',
        attachment_filepath: '/uploads/green_campus_plan_2024-2028.pdf',
        attachment_filesize: 5234156
      },
      {
        title: '재생에너지 도입 현황 보고서',
        content: '캠퍼스 내 태양광, 지열 등 재생에너지 시설 도입 현황과 성과를 정리한 보고서입니다.',
        excerpt: '재생에너지 현황 보고서',
        attachment_filename: '재생에너지_도입현황_2024.xlsx',
        attachment_filepath: '/uploads/renewable_energy_status_2024.xlsx',
        attachment_filesize: 856432
      },
      {
        title: '탄소배출량 측정 및 감축 방안 연구',
        content: '서울대학교 탄소배출량 측정 방법론과 부문별 감축 방안을 연구한 보고서입니다.',
        excerpt: '탄소배출 감축 연구',
        attachment_filename: '탄소배출_감축방안_연구보고서.pdf',
        attachment_filepath: '/uploads/carbon_reduction_research.pdf',
        attachment_filesize: 3867290
      },
      {
        title: '친환경 건물 인증 가이드라인',
        content: 'LEED, G-SEED 등 친환경 건물 인증 제도 소개 및 캠퍼스 적용 가이드라인입니다.',
        excerpt: '친환경 건물 인증 가이드',
        attachment_filename: '친환경건물_인증가이드라인_v2.pdf',
        attachment_filepath: '/uploads/green_building_guidelines_v2.pdf',
        attachment_filesize: 1923847
      },
      {
        title: '폐기물 재활용 실적 보고서 (2023년)',
        content: '2023년 한 해 동안의 캠퍼스 폐기물 발생량 및 재활용 실적을 정리한 보고서입니다.',
        excerpt: '폐기물 재활용 실적',
        attachment_filename: '폐기물_재활용실적_2023.pdf',
        attachment_filepath: '/uploads/waste_recycling_report_2023.pdf',
        attachment_filesize: 1456789
      },
      {
        title: '에너지 절약 캠페인 결과 보고서',
        content: '전 구성원이 참여한 에너지 절약 캠페인의 성과와 개선점을 분석한 보고서입니다.',
        excerpt: '에너지 절약 캠페인',
        attachment_filename: '에너지절약_캠페인결과_2024.docx',
        attachment_filepath: '/uploads/energy_saving_campaign_2024.docx',
        attachment_filesize: 987654
      },
      {
        title: '탄소중립 교육 프로그램 운영 매뉴얼',
        content: '학생, 교직원 대상 탄소중립 교육 프로그램 운영을 위한 상세 매뉴얼입니다.',
        excerpt: '교육 프로그램 매뉴얼',
        attachment_filename: '탄소중립_교육프로그램_매뉴얼.pdf',
        attachment_filepath: '/uploads/carbon_neutral_education_manual.pdf',
        attachment_filesize: 2134567
      }
    ];
    
    // Insert sample posts
    for (const post of samplePosts) {
      const result = await client.query(`
        INSERT INTO posts (
          title, content, excerpt, board_id, 
          attachment_filename, attachment_filepath, attachment_filesize,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [
        post.title,
        post.content,
        post.excerpt,
        boardId,
        post.attachment_filename,
        post.attachment_filepath,
        post.attachment_filesize
      ]);
      
      console.log(`✅ 추가됨: ${post.title} (ID: ${result.rows[0].id})`);
    }
    
    console.log(`\n✅ ${samplePosts.length}개의 샘플 게시물이 추가되었습니다.`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addSamplePosts();