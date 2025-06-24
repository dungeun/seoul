#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function uploadSeoulLinks() {
  console.log('📋 Seoul 교수 데이터 업로드 시작...\n');
  
  const client = await pool.connect();
  
  try {
    // CSV 파일 읽기
    const csvPath = path.join(__dirname, '../../seoul_link_end.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // CSV 파싱
    const records = parse(csvContent, {
      columns: false,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true
    });
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];
    
    console.log(`총 ${records.length}개의 레코드를 처리합니다.\n`);
    
    // 기존 데이터 삭제 여부 확인
    const existingCount = await client.query('SELECT COUNT(*) FROM link_posts');
    if (existingCount.rows[0].count > 0) {
      console.log(`⚠️  기존 데이터 ${existingCount.rows[0].count}개가 있습니다.`);
      console.log('기존 데이터를 유지하고 새 데이터를 추가합니다.\n');
    }
    
    // 데이터 처리
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      
      // 데이터가 있는 행만 처리
      if (row[0] && row[1] && row[2] && row[3]) {
        const mainCategory = row[0].trim().replace(/\n/g, ' ');
        const subCategory = row[1].trim().replace(/\n/g, ' ');
        const professor = row[2].trim();
        let url = row[3].trim();
        const orderNum = row[5] ? parseInt(row[5]) : 0;
        
        // 교수명과 학과 분리
        const matches = professor.match(/(.+?)\((.+?)\)/);
        const professorName = matches ? matches[1].trim() : professor;
        const department = matches ? matches[2].trim() : '';
        
        // URL 유효성 검사 및 수정
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'http://' + url;
        }
        
        try {
          // 중복 확인
          const existing = await client.query(
            'SELECT id FROM link_posts WHERE link_url = $1',
            [url]
          );
          
          if (existing.rows.length > 0) {
            skipCount++;
            console.log(`⏭️  중복 URL 스킵: ${url}`);
          } else {
            // 데이터 삽입
            await client.query(
              `INSERT INTO link_posts 
              (title, content, link_url, main_category, sub_category, status, order_index, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [
                `${professorName} (${department})`,
                `${mainCategory} - ${subCategory}`,
                url,
                mainCategory,
                subCategory,
                'published',
                orderNum
              ]
            );
            
            successCount++;
            
            if (successCount % 10 === 0) {
              console.log(`✅ ${successCount}개 처리 완료...`);
            }
          }
        } catch (error) {
          errorCount++;
          errors.push(`행 ${i + 1}: ${error.message}`);
          console.error(`❌ 행 ${i + 1} 오류:`, error.message);
        }
      }
    }
    
    console.log('\n📊 업로드 완료!');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`⏭️  중복: ${skipCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    
    if (errors.length > 0) {
      console.log('\n오류 상세:');
      errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
      if (errors.length > 10) {
        console.log(`  ... 외 ${errors.length - 10}개`);
      }
    }
    
    // 카테고리별 통계
    const stats = await client.query(`
      SELECT main_category, sub_category, COUNT(*) as count
      FROM link_posts
      GROUP BY main_category, sub_category
      ORDER BY main_category, sub_category
    `);
    
    console.log('\n📈 카테고리별 통계:');
    let currentMain = '';
    stats.rows.forEach(row => {
      if (row.main_category !== currentMain) {
        currentMain = row.main_category;
        console.log(`\n${currentMain}:`);
      }
      console.log(`  - ${row.sub_category}: ${row.count}개`);
    });
    
  } catch (error) {
    console.error('❌ 업로드 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 스크린샷 생성 스크립트
async function generateScreenshots() {
  console.log('\n\n🖼️  스크린샷 생성을 시작하시겠습니까?');
  console.log('이 작업은 시간이 오래 걸릴 수 있습니다.');
  console.log('백그라운드에서 실행하려면 별도의 프로세스로 실행하세요.');
  console.log('\n스크린샷 생성 명령:');
  console.log('node scripts/generate-screenshots.js');
}

uploadSeoulLinks()
  .then(() => generateScreenshots())
  .catch(console.error);