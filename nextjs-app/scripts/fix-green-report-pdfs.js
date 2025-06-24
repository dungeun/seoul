#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixPDFs() {
  const client = await pool.connect();
  
  try {
    // featured_image를 제거하고 attachment_filepath를 수정
    const updates = [
      { id: 8, filepath: '/uploads/carbon_neutral_guide_2024.pdf' },
      { id: 9, filepath: '/uploads/green_campus_plan_2024.pdf' },
      { id: 10, filepath: '/uploads/renewable_energy_status_2024.pdf' },
      { id: 11, filepath: '/uploads/carbon_reduction_research.pdf' },
      { id: 12, filepath: '/uploads/green_building_guidelines.pdf' },
      { id: 13, filepath: '/uploads/waste_recycling_report_2023.pdf' },
      { id: 14, filepath: '/uploads/energy_saving_campaign_2024.pdf' },
      { id: 15, filepath: '/uploads/carbon_neutral_education_manual.pdf' }
    ];
    
    for (const update of updates) {
      await client.query(
        `UPDATE posts 
         SET featured_image = NULL,
             attachment_filepath = $1
         WHERE id = $2`,
        [update.filepath, update.id]
      );
      console.log(`✅ 수정됨: Post ID ${update.id}`);
    }
    
    // 나머지 PDF 파일들도 생성
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
    
    // 3-8번 파일을 위한 더미 PDF 복사
    const sourcePDF = path.join(uploadsDir, 'carbon_neutral_guide_2024.pdf');
    
    const filesToCopy = [
      'renewable_energy_status_2024.pdf',
      'carbon_reduction_research.pdf',
      'green_building_guidelines.pdf',
      'waste_recycling_report_2023.pdf',
      'energy_saving_campaign_2024.pdf',
      'carbon_neutral_education_manual.pdf'
    ];
    
    for (const filename of filesToCopy) {
      const destPath = path.join(uploadsDir, filename);
      fs.copyFileSync(sourcePDF, destPath);
      console.log(`✅ PDF 복사됨: ${filename}`);
    }
    
    console.log('\n✅ 모든 작업 완료!');
    
  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixPDFs();