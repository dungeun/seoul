import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Menu {
  id: number;
  name: string;
  url: string;
  type: string;
  page_id?: number | null;
  board_id?: number | null;
  sort_order: number;
  is_active: number;
  content?: string;
  created_at: string;
}

// PUT - 특정 메뉴 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const { name, url, type, page_id, board_id, sort_order, is_active, content } = await request.json();

    if (!name || !url || !type) {
      return NextResponse.json({ error: '이름, URL, 타입은 필수입니다' }, { status: 400 });
    }

    await dbQuery.run(
      'UPDATE menus SET name = $1, url = $2, type = $3, page_id = $4, board_id = $5, sort_order = $6, is_active = $7, content = $8 WHERE id = $9',
      [name, url, type, page_id || null, board_id || null, sort_order || 0, is_active ? true : false, content || null, id]
    );

    const updatedMenu = await dbQuery.get<Menu>('SELECT * FROM menus WHERE id = $1', [id]);

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error('메뉴 수정 오류:', error);
    return NextResponse.json({ error: '메뉴 수정에 실패했습니다' }, { status: 500 });
  }
}

// DELETE - 특정 메뉴 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    await dbQuery.run('DELETE FROM menus WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('메뉴 삭제 오류:', error);
    return NextResponse.json({ error: '메뉴 삭제에 실패했습니다' }, { status: 500 });
  }
} 