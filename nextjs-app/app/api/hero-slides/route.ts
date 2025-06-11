import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  background_color?: string;
  background_image?: string;
  text_color: string;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// GET - 모든 히어로 슬라이드 조회
export async function GET() {
  try {
    const slides = dbQuery.all<HeroSlide>(`
      SELECT id, title, subtitle, description, button_text, background_color, background_image, text_color, order_index, active, created_at, updated_at 
      FROM hero_slides 
      ORDER BY order_index ASC, created_at DESC
    `);

    return NextResponse.json(slides);
  } catch (error) {
    console.error('히어로 슬라이드 조회 오류:', error);
    return NextResponse.json({ error: '히어로 슬라이드를 불러오는데 실패했습니다' }, { status: 500 });
  }
}

// POST - 새 히어로 슬라이드 생성
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      subtitle, 
      description, 
      button_text, 
      background_color, 
      background_image, 
      text_color = 'white', 
      order_index = 0, 
      active = true 
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: '제목은 필수입니다' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const result = dbQuery.run(
      'INSERT INTO hero_slides (title, subtitle, description, button_text, background_color, background_image, text_color, order_index, active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, subtitle || null, description || null, button_text || null, background_color || null, background_image || null, text_color, order_index, active ? 1 : 0, now, now]
    );

    const newSlide = dbQuery.get<HeroSlide>('SELECT * FROM hero_slides WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('히어로 슬라이드 생성 오류:', error);
    return NextResponse.json({ error: '히어로 슬라이드 생성에 실패했습니다' }, { status: 500 });
  }
}

// PUT - 히어로 슬라이드 수정
export async function PUT(request: NextRequest) {
  try {
    const { 
      id, 
      title, 
      subtitle, 
      description, 
      button_text, 
      background_color, 
      background_image, 
      text_color, 
      order_index, 
      active 
    } = await request.json();

    if (!id || !title) {
      return NextResponse.json({ error: 'ID와 제목은 필수입니다' }, { status: 400 });
    }

    const now = new Date().toISOString();
    dbQuery.run(
      'UPDATE hero_slides SET title = ?, subtitle = ?, description = ?, button_text = ?, background_color = ?, background_image = ?, text_color = ?, order_index = ?, active = ?, updated_at = ? WHERE id = ?',
      [title, subtitle || null, description || null, button_text || null, background_color || null, background_image || null, text_color || 'white', order_index || 0, active ? 1 : 0, now, id]
    );

    const updatedSlide = dbQuery.get<HeroSlide>('SELECT * FROM hero_slides WHERE id = ?', [id]);

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('히어로 슬라이드 수정 오류:', error);
    return NextResponse.json({ error: '히어로 슬라이드 수정에 실패했습니다' }, { status: 500 });
  }
}

// DELETE - 히어로 슬라이드 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 });
    }

    dbQuery.run('DELETE FROM hero_slides WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('히어로 슬라이드 삭제 오류:', error);
    return NextResponse.json({ error: '히어로 슬라이드 삭제에 실패했습니다' }, { status: 500 });
  }
}