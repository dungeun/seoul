import { NextRequest, NextResponse } from 'next/server';

// GET /api/boards - 게시판 목록 조회
export async function GET(request: NextRequest) {
  try {
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/boards`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch boards');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Boards fetch error:', error);
    return NextResponse.json(
      { error: '게시판 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}