import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import bcrypt from 'bcrypt';

interface User {
  id: number;
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 조회
    const user = await dbQuery.get<User>(
      'SELECT id, username, password FROM users WHERE username = $1',
      [username]
    );

    if (!user) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 성공 응답 (간단한 토큰 기반 세션)
    const response = NextResponse.json({
      success: true,
      username: user.username,
      message: '로그인에 성공했습니다.'
    });

    // 간단한 인증 쿠키 설정 (실제 운영에서는 JWT 또는 세션 스토어 사용 권장)
    response.cookies.set('admin-token', `${user.id}:${user.username}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;
  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}