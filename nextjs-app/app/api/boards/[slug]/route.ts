import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 백엔드 서버로 요청 프록시
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/boards/${slug}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: error || 'Board not found' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}