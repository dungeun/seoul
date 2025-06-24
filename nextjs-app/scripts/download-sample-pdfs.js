#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// 샘플 PDF URL들 (공개적으로 사용 가능한 PDF)
const samplePDFs = [
  {
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    filename: 'carbon_neutral_guide_2024.pdf',
    postId: 8
  },
  {
    url: 'https://www.africau.edu/images/default/sample.pdf',
    filename: 'green_campus_plan_2024.pdf',
    postId: 9
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // 에러 시 파일 삭제
      reject(err);
    });
  });
}

async function downloadAndUpdatePDFs() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client = await pool.connect();
  
  try {
    for (const pdf of samplePDFs) {
      const destPath = path.join(uploadsDir, pdf.filename);
      
      console.log(`📥 다운로드 중: ${pdf.filename}...`);
      
      try {
        await downloadFile(pdf.url, destPath);
        console.log(`✅ 다운로드 완료: ${pdf.filename}`);
        
        // DB 업데이트
        await client.query(
          `UPDATE posts 
           SET attachment_filepath = $1
           WHERE id = $2`,
          [`/uploads/${pdf.filename}`, pdf.postId]
        );
        
        console.log(`✅ DB 업데이트 완료: Post ID ${pdf.postId}`);
      } catch (error) {
        console.error(`❌ 다운로드 실패: ${pdf.filename}`, error.message);
      }
    }
    
    console.log('\n✅ 모든 작업 완료!');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

downloadAndUpdatePDFs();