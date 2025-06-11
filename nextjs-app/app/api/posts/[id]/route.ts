import { NextRequest, NextResponse } from 'next/server';

// GET /api/posts/[id] - 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/posts/${id}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: '게시글을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/posts/${id}`;
    
    if (contentType.includes('multipart/form-data')) {
      // FormData 처리 (파일 업로드 포함)
      const formData = await request.formData();
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // JSON 처리
      const jsonData = await request.json();
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { error: error.message || '게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/posts/${id}`;
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}