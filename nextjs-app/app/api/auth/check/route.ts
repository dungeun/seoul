import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 백엔드 서버로 세션 체크 요청
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/auth/check`;
    const response = await fetch(apiUrl, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('세션 체크 오류:', error);
    return NextResponse.json({ authenticated: false });
  }
}