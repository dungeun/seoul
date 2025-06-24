import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const { name, department, url, screenshot_url, main_category, sub_category, order_index, status } = data;

    // 필수 필드 검증
    if (!name || !department || !url || !main_category || !sub_category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // URL 중복 체크 (자기 자신 제외)
    const existing = await dbQuery.get(
      'SELECT id FROM carbon_tech_posts WHERE url = $1 AND id != $2',
      [url, id]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'URL already exists' },
        { status: 400 }
      );
    }

    // 데이터 업데이트
    const result = await dbQuery.run(
      `UPDATE carbon_tech_posts 
      SET name = $1, department = $2, url = $3, screenshot_url = $4, 
          main_category = $5, sub_category = $6, order_index = $7, 
          status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [name, department, url, screenshot_url || null, main_category, sub_category, 
       order_index || 0, status || 'published', id]
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error updating carbon tech post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 데이터 삭제
    await dbQuery.run(
      'DELETE FROM carbon_tech_posts WHERE id = $1',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting carbon tech post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}