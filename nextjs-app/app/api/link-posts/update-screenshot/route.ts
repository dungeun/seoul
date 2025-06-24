import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { url, screenshot_url } = await request.json();
    
    if (!url || !screenshot_url) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // URL로 게시글 찾아서 스크린샷 업데이트
    await dbQuery.run(
      `UPDATE link_posts SET image_url = $1, updated_at = CURRENT_TIMESTAMP WHERE link_url = $2`,
      [screenshot_url, url]
    );

    return NextResponse.json({ 
      success: true,
      message: '스크린샷이 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('Error updating screenshot:', error);
    return NextResponse.json(
      { error: '스크린샷 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}