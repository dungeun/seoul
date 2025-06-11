import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/posts${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: '게시글 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/posts`;
    
    if (contentType.includes('multipart/form-data')) {
      // FormData 처리 (파일 업로드 포함)
      const formData = await request.formData();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // JSON 처리
      const jsonData = await request.json();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: error.message || '게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}