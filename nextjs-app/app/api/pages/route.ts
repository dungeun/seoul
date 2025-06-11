import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const pagesDir = path.join(process.cwd(), 'app', '(public)');
    const pages: { name: string; path: string }[] = [];

    // Read directories in (public) folder
    const dirs = fs.readdirSync(pagesDir, { withFileTypes: true });
    
    for (const dir of dirs) {
      if (dir.isDirectory()) {
        pages.push({
          name: dir.name,
          path: `/${dir.name}`
        });
      }
    }

    // Add any other known pages
    const knownPages = [
      { name: 'history', path: '/history' },
      { name: 'about', path: '/about' },
      { name: 'contact', path: '/contact' }
    ];

    return NextResponse.json([...pages, ...knownPages]);
  } catch (error) {
    console.error('페이지 목록 조회 오류:', error);
    return NextResponse.json({ error: '페이지 목록을 불러오는데 실패했습니다' }, { status: 500 });
  }
}