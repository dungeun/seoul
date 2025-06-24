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
        { error: 'URL and screenshot_url are required' },
        { status: 400 }
      );
    }

    // 스크린샷 URL 업데이트
    await dbQuery.run(
      `UPDATE carbon_tech_posts 
       SET screenshot_url = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE url = $2`,
      [screenshot_url, url]
    );

    return NextResponse.json({
      success: true,
      message: 'Screenshot updated successfully'
    });

  } catch (error) {
    console.error('Error updating screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to update screenshot' },
      { status: 500 }
    );
  }
}