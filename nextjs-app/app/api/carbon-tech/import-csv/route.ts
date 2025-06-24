import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'CSV 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // CSV 파일 읽기
    const text = await file.text();
    
    // CSV 파싱
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true
    });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      
      try {
        // CSV 열 이름 매핑 (다양한 형식 지원)
        const mainCategory = row['대분류'] || row['main_category'] || '';
        const subCategory = row['중분류'] || row['sub_category'] || '';
        const professorName = row['교수명'] || row['name'] || row['professor_name'] || '';
        const department = row['학과'] || row['department'] || row['professor_dept'] || '';
        const websiteUrl = row['웹사이트URL'] || row['url'] || row['website_url'] || '';
        const orderNum = row['순번'] || row['order'] || row['order_num'] || row['order_index'] || '0';
        
        // 필수 필드 검증
        if (!mainCategory || !subCategory || !professorName || !department || !websiteUrl) {
          errors.push(`행 ${i + 2}: 필수 필드 누락`);
          errorCount++;
          continue;
        }
        
        // URL 유효성 검사
        if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
          errors.push(`행 ${i + 2}: 잘못된 URL 형식 - ${websiteUrl}`);
          errorCount++;
          continue;
        }
        
        // 중복 확인
        const existing = await dbQuery.get(
          `SELECT id FROM carbon_tech_posts WHERE url = $1`,
          [websiteUrl]
        );
        
        if (!existing) {
          // 데이터베이스에 저장
          await dbQuery.run(
            `INSERT INTO carbon_tech_posts 
            (name, department, url, main_category, sub_category, order_index, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              professorName,
              department,
              websiteUrl,
              mainCategory,
              subCategory,
              parseInt(orderNum) || 0,
              'published'
            ]
          );
          
          successCount++;
          
          // 스크린샷 생성 요청 (비동기로 처리)
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: websiteUrl })
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // 스크린샷 URL 업데이트
              await dbQuery.run(
                `UPDATE carbon_tech_posts SET screenshot_url = $1 WHERE url = $2`,
                [data.screenshot_url, websiteUrl]
              );
            }
          }).catch(console.error);
          
        } else {
          errors.push(`행 ${i + 2}: 중복된 URL - ${websiteUrl}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`Error processing row ${i + 2}:`, error);
        errors.push(`행 ${i + 2}: 처리 오류`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `CSV 업로드 완료: 성공 ${successCount}개, 실패 ${errorCount}개`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'CSV 파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}