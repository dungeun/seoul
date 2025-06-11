import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Menu {
  id: number;
  name: string;
  url: string;
  type: string;
  page_id?: number | null;
  board_id?: number | null;
  parent_id?: number | null;
  sort_order: number;
  is_active: number;
  content?: string;
  created_at: string;
}

// GET - 모든 메뉴 조회
export async function GET() {
  try {
    const menus = dbQuery.all<Menu>(`
      SELECT id, name, url, type, page_id, board_id, parent_id, sort_order, is_active, content, created_at 
      FROM menus 
      WHERE is_active = 1
      ORDER BY parent_id ASC NULLS FIRST, sort_order ASC, created_at DESC
    `);

    return NextResponse.json(menus);
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    return NextResponse.json({ error: '메뉴를 불러오는데 실패했습니다' }, { status: 500 });
  }
}

// POST - 새 메뉴 생성
export async function POST(request: NextRequest) {
  try {
    const { name, url, type, page_id, board_id, parent_id, sort_order = 0, is_active = true, content } = await request.json();

    if (!name || !url || !type) {
      return NextResponse.json({ error: '이름, URL, 타입은 필수입니다' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const result = dbQuery.run(
      'INSERT INTO menus (name, url, type, page_id, board_id, parent_id, sort_order, is_active, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, url, type, page_id || null, board_id || null, parent_id || null, sort_order, is_active ? 1 : 0, content || null, now]
    );

    const newMenu = dbQuery.get<Menu>('SELECT * FROM menus WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('메뉴 생성 오류:', error);
    return NextResponse.json({ error: '메뉴 생성에 실패했습니다' }, { status: 500 });
  }
}

// PUT - 메뉴 수정
export async function PUT(request: NextRequest) {
  try {
    const { id, name, url, type, page_id, board_id, parent_id, sort_order, is_active, content } = await request.json();

    if (!id || !name || !url || !type) {
      return NextResponse.json({ error: 'ID, 이름, URL, 타입은 필수입니다' }, { status: 400 });
    }

    dbQuery.run(
      'UPDATE menus SET name = ?, url = ?, type = ?, page_id = ?, board_id = ?, parent_id = ?, sort_order = ?, is_active = ?, content = ? WHERE id = ?',
      [name, url, type, page_id || null, board_id || null, parent_id || null, sort_order || 0, is_active ? 1 : 0, content || null, id]
    );

    const updatedMenu = dbQuery.get<Menu>('SELECT * FROM menus WHERE id = ?', [id]);

    return NextResponse.json(updatedMenu);
  } catch (error) {
    console.error('메뉴 수정 오류:', error);
    return NextResponse.json({ error: '메뉴 수정에 실패했습니다' }, { status: 500 });
  }
}

// DELETE - 메뉴 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 });
    }

    // 하위 메뉴들도 함께 삭제 (필요 시)
    dbQuery.run('DELETE FROM menus WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('메뉴 삭제 오류:', error);
    return NextResponse.json({ error: '메뉴 삭제에 실패했습니다' }, { status: 500 });
  }
}