import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pagePath = searchParams.get('path');
    
    if (!pagePath) {
      return NextResponse.json({ error: '페이지 경로가 필요합니다' }, { status: 400 });
    }

    // Remove leading slash and construct file path
    const cleanPath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath;
    
    // Try to find the page.tsx file
    const possiblePaths = [
      path.join(process.cwd(), 'app', '(public)', cleanPath, 'page.tsx'),
      path.join(process.cwd(), 'app', cleanPath, 'page.tsx'),
      path.join(process.cwd(), 'pages', `${cleanPath}.tsx`),
      path.join(process.cwd(), 'pages', cleanPath, 'index.tsx')
    ];

    let content = '';
    let found = false;

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8');
        found = true;
        break;
      }
    }

    if (!found) {
      // Check if it's a static HTML file
      const htmlPath = path.join(process.cwd(), 'public', 'html', `${cleanPath}.html`);
      if (fs.existsSync(htmlPath)) {
        content = fs.readFileSync(htmlPath, 'utf-8');
        found = true;
      }
    }

    return NextResponse.json({ 
      content: found ? content : '',
      found: found
    });
  } catch (error) {
    console.error('페이지 콘텐츠 조회 오류:', error);
    return NextResponse.json({ error: '페이지 콘텐츠를 불러오는데 실패했습니다' }, { status: 500 });
  }
}