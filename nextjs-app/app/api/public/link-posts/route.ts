import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/public/link-posts - 공개 링크 게시글 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const main_category = searchParams.get('main_category') || '';
    const sub_category = searchParams.get('sub_category') || '';

    const queryParams = new URLSearchParams({
      ...(main_category && { main_category }),
      ...(sub_category && { sub_category })
    });

    const response = await fetch(`${API_BASE_URL}/api/public/link-posts?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch public link posts: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching public link posts:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}