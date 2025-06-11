import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 백엔드 서버로 로그인 요청 전송
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/login`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 백엔드에서 받은 세션 쿠키를 Next.js 응답에 포함
    const backendCookies = response.headers.get('set-cookie');
    const nextResponse = NextResponse.json({
      success: true,
      username: data.username,
      message: '로그인에 성공했습니다.'
    });

    // 백엔드의 쿠키를 그대로 전달
    if (backendCookies) {
      nextResponse.headers.set('set-cookie', backendCookies);
    }

    return nextResponse;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}