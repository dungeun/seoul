import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/link-posts/[id] - 링크 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/link-posts/${id}`, {
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch link post: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/link-posts/[id] - 링크 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/link-posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update link post: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/link-posts/[id] - 링크 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/link-posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete link post: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting link post:', error);
    return NextResponse.json(
      { error: error.message || '링크 게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}