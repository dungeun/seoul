import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Board {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  created_at: string;
}

// GET /api/boards - 게시판 목록 조회
export async function GET() {
  try {
    const boards = await dbQuery.all<Board>(`
      SELECT id, name, slug, description, type, created_at 
      FROM boards 
      ORDER BY id ASC
    `);

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Boards fetch error:', error);
    return NextResponse.json(
      { error: '게시판 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/boards - 새 게시판 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, type } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: '게시판 이름과 URL은 필수입니다' },
        { status: 400 }
      );
    }

    // slug 중복 확인
    const existingBoard = await dbQuery.get<Board>(
      'SELECT id FROM boards WHERE slug = $1',
      [slug]
    );

    if (existingBoard) {
      return NextResponse.json(
        { error: '이미 사용 중인 URL입니다' },
        { status: 400 }
      );
    }

    // 게시판 생성
    const result = await dbQuery.get<{ id: number }>(
      `INSERT INTO boards (name, slug, description, type, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id`,
      [name, slug, description, type || 'list']
    );

    if (!result) {
      throw new Error('Failed to create board');
    }

    const newBoard = await dbQuery.get<Board>(
      'SELECT * FROM boards WHERE id = $1',
      [result.id]
    );

    return NextResponse.json(newBoard, { status: 201 });
  } catch (error) {
    console.error('Failed to create board:', error);
    return NextResponse.json(
      { error: '게시판 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}