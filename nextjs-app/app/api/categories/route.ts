import { NextRequest, NextResponse } from 'next/server';

// GET /api/categories - 카테고리 목록 조회
export async function GET(request: NextRequest) {
  try {
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/categories`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}