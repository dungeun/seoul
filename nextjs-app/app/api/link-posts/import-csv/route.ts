import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { parse } from 'csv-parse/sync';

interface CSVRow {
  category_main: string;
  category_sub: string;
  professor_name: string;
  professor_dept: string;
  website_url: string;
  order_num: string;
}

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
    
    // CSV 파싱 (한글 헤더 처리)
    const records = parse(text, {
      columns: false,
      skip_empty_lines: true,
      relax_quotes: true,
      trim: true
    });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    // 현재 대분류와 중분류 추적
    let currentMainCategory = '';
    let currentSubCategory = '';

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      
      // 첫 번째 컬럼이 비어있지 않으면 대분류
      if (row[0] && row[0].trim()) {
        currentMainCategory = row[0].trim();
        continue;
      }
      
      // 두 번째 컬럼이 비어있지 않으면 중분류
      if (row[1] && row[1].trim()) {
        currentSubCategory = row[1].trim();
      }
      
      // 교수 정보가 있는 경우
      if (row[2] && row[3] && row[4]) {
        try {
          const professorName = row[2].trim();
          const department = row[3].trim();
          const websiteUrl = row[4].trim();
          const orderNum = row[5]?.trim() || '0';
          
          // URL 유효성 검사
          if (!websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
            errors.push(`행 ${i + 1}: 잘못된 URL 형식 - ${websiteUrl}`);
            errorCount++;
            continue;
          }
          
          // 제목 생성
          const title = `${professorName} (${department})`;
          const content = `${currentMainCategory} - ${currentSubCategory}`;
          
          // 중복 확인
          const existing = await dbQuery.get(
            `SELECT id FROM link_posts WHERE link_url = $1`,
            [websiteUrl]
          );
          
          if (!existing) {
            // 데이터베이스에 저장
            await dbQuery.run(
              `INSERT INTO link_posts 
              (title, content, link_url, main_category, sub_category, status, order_index)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                title,
                content,
                websiteUrl,
                currentMainCategory,
                currentSubCategory,
                'published',
                parseInt(orderNum) || 0
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
                  `UPDATE link_posts SET image_url = $1 WHERE link_url = $2`,
                  [data.screenshot_url, websiteUrl]
                );
              }
            }).catch(console.error);
            
          } else {
            errors.push(`행 ${i + 1}: 중복된 URL - ${websiteUrl}`);
            errorCount++;
          }
          
        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errors.push(`행 ${i + 1}: 처리 오류`);
          errorCount++;
        }
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