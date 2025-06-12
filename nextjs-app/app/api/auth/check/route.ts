import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface User {
  id: number;
  username: string;
}

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get('admin-token')?.value;

    if (!adminToken) {
      return NextResponse.json({ authenticated: false });
    }

    // 토큰 파싱 (형식: "id:username")
    const [userId, username] = adminToken.split(':');
    
    if (!userId || !username) {
      return NextResponse.json({ authenticated: false });
    }

    // 사용자 존재 확인
    const user = await dbQuery.get<User>(
      'SELECT id, username FROM users WHERE id = $1 AND username = $2',
      [parseInt(userId), username]
    );

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      username: user.username
    });
  } catch (error) {
    console.error('세션 체크 오류:', error);
    return NextResponse.json({ authenticated: false });
  }
}