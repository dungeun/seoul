import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 현재 경로 확인
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();

  // 정적 자산에 대한 캐시 헤더 설정
  if (path.startsWith('/img/') || 
      path.startsWith('/downloads/') ||
      path.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return response;
  }
  
  // Public API 응답에 대한 기본 캐시 헤더
  if (path.startsWith('/api/public/')) {
    // 기본 캐시 설정 (개별 라우트에서 오버라이드 가능)
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  }

  // /admin으로 시작하는 경로인지 확인
  if (path.startsWith('/admin')) {
    // 로그인 페이지와 API 경로는 제외
    if (path === '/admin/login' || path.startsWith('/api/')) {
      return response;
    }

    // 직접 쿠키 확인 (간단한 인증)
    const adminToken = request.cookies.get('admin-token')?.value;
    
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 토큰 형식 검증 (id:username)
    const tokenParts = adminToken.split(':');
    if (tokenParts.length !== 2 || !tokenParts[0] || !tokenParts[1]) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return response;
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/public/:path*',
    '/img/:path*',
    '/downloads/:path*',
    '/_next/static/:path*'
  ]
};