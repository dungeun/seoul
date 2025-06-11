import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/link-posts - 링크 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    const cookie = request.headers.get('cookie');
    
    const queryParams = new URLSearchParams({
      page,
      ...(category && { category }),
      ...(search && { search })
    });

    const response = await fetch(`${API_BASE_URL}/api/link-posts?${queryParams}`, {
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch link posts: ${response.status}`);
    }

    const data = await response.json();
    // 관리자 페이지는 posts 배열을 직접 기대하므로 posts만 반환
    return NextResponse.json(data.posts || data);
  } catch (error: any) {
    console.error('Error fetching link posts:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/link-posts - 링크 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/link-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create link post: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}