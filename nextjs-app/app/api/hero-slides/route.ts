import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  link_url?: string;
  background_image?: string;
  background_color?: string;
  text_color?: string;
  order_index: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// GET - 모든 히어로 슬라이드 조회
export async function GET() {
  try {
    const slides = await dbQuery.all<HeroSlide>(`
      SELECT * FROM hero_slides 
      WHERE active = true
      ORDER BY order_index ASC, created_at DESC
    `);

    // 캐시 헤더 추가 - 1시간 캐싱
    return NextResponse.json(slides, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { error: '히어로 슬라이드를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
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
      background_image, 
      background_color, 
      text_color = 'white', 
      order_index = 0, 
      active = true 
    } = await request.json();

    if (!title) {
      return NextResponse.json({ error: '제목이 필요합니다' }, { status: 400 });
    }

    const result = await dbQuery.run(`
      INSERT INTO hero_slides (title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active]);

    const newSlide = await dbQuery.get<HeroSlide>(
      'SELECT * FROM hero_slides WHERE id = $1',
      [result.rows[0]?.id]
    );

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json(
      { error: '히어로 슬라이드 생성에 실패했습니다.' },
      { status: 500 }
    );
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
      background_image, 
      background_color, 
      text_color, 
      order_index, 
      active 
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 });
    }

    await dbQuery.run(`
      UPDATE hero_slides 
      SET title = $2, subtitle = $3, description = $4, button_text = $5, 
          background_image = $6, background_color = $7, text_color = $8, 
          order_index = $9, active = $10, updated_at = NOW()
      WHERE id = $1
    `, [id, title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active]);

    const updatedSlide = await dbQuery.get<HeroSlide>(
      'SELECT * FROM hero_slides WHERE id = $1',
      [id]
    );

    return NextResponse.json(updatedSlide);
  } catch (error: any) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { error: '히어로 슬라이드 수정에 실패했습니다.' },
      { status: 500 }
    );
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

    await dbQuery.run('DELETE FROM hero_slides WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: '히어로 슬라이드가 삭제되었습니다.' });
  } catch (error: any) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { error: '히어로 슬라이드 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}