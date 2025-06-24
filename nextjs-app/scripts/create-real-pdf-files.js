#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// HTML to PDF conversion using simple approach
function createSimplePDF(filename, title, content) {
  // PDF 헤더
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
  /Font <<
    /F1 4 0 R
  >>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length ${content.length + 100}
>>
stream
BT
/F1 24 Tf
72 720 Td
(${title}) Tj
0 -40 Td
/F1 12 Tf
(${content.replace(/\n/g, ') Tj 0 -20 Td (')}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000279 00000 n 
0000000364 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${500 + content.length}
%%EOF`;

  return pdfContent;
}

async function createPDFs() {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  
  // 간단한 PDF 생성 (ASCII 텍스트만)
  const pdfFiles = [
    {
      filename: '2024_carbon_neutral_guide_real.pdf',
      title: '2024 Carbon Neutral Guide',
      content: 'This is a guide for carbon neutral practices at Seoul National University.'
    },
    {
      filename: 'green_campus_plan_2024-2028_real.pdf',
      title: 'Green Campus Plan 2024-2028',
      content: 'Strategic plan for achieving carbon neutrality on campus by 2028.'
    }
  ];

  for (const pdf of pdfFiles) {
    const pdfContent = createSimplePDF(pdf.filename, pdf.title, pdf.content);
    const filePath = path.join(uploadsDir, pdf.filename);
    fs.writeFileSync(filePath, pdfContent, 'binary');
    console.log(`✅ PDF 생성됨: ${pdf.filename}`);
  }

  // DB 업데이트
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  try {
    // 첫 번째 두 게시물의 파일 경로 업데이트
    await client.query(
      `UPDATE posts 
       SET attachment_filepath = '/uploads/2024_carbon_neutral_guide_real.pdf',
           attachment_filename = '2024_탄소중립_실천가이드.pdf'
       WHERE id = 8`
    );
    
    await client.query(
      `UPDATE posts 
       SET attachment_filepath = '/uploads/green_campus_plan_2024-2028_real.pdf',
           attachment_filename = '그린캠퍼스_조성계획서_2024-2028.pdf' 
       WHERE id = 9`
    );
    
    console.log('\n✅ 데이터베이스 업데이트 완료');
    
  } catch (error) {
    console.error('DB 업데이트 오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPDFs().catch(console.error);