import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 백엔드 서버로 요청 프록시
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/post/${id}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Post not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}