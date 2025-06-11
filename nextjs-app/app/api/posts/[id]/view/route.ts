import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// POST - 조회수 증가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    dbQuery.run(
      'UPDATE posts SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    return NextResponse.json({ error: '조회수 증가에 실패했습니다' }, { status: 500 });
  }
}