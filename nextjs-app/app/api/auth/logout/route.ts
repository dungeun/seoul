import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 백엔드 서버로 로그아웃 요청 전송
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/logout`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const nextResponse = NextResponse.json({ 
      success: true, 
      message: '로그아웃되었습니다.' 
    });

    // 세션 쿠키 삭제
    nextResponse.cookies.delete('connect.sid');
    nextResponse.cookies.delete('admin-token');

    return nextResponse;
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}