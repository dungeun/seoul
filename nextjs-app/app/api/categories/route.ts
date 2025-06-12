import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Category {
  id: number;
  name: string;
  type?: string;
  sort_order?: number;
  created_at: string;
}

// GET /api/categories - 카테고리 목록 조회
export async function GET() {
  try {
    const categories = await dbQuery.all<Category>(`
      SELECT id, name, type, sort_order, created_at 
      FROM categories 
      ORDER BY sort_order ASC, name ASC
    `);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}