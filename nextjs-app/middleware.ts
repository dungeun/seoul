import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 현재 경로 확인
  const path = request.nextUrl.pathname;

  // /admin으로 시작하는 경로인지 확인
  if (path.startsWith('/admin')) {
    // 로그인 페이지와 API 경로는 제외
    if (path === '/admin/login' || path.startsWith('/api/')) {
      return NextResponse.next();
    }

    // 백엔드 세션 확인
    try {
      const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/auth/check`;
      const response = await fetch(apiUrl, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });

      const data = await response.json();

      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      if (!data.authenticated) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      // 에러 발생 시 로그인 페이지로 리다이렉트
      console.error('Auth check error:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: '/admin/:path*'
};