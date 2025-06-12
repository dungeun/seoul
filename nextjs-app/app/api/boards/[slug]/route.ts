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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Fetching board with slug/id:', slug);
    
    // slug가 숫자인지 확인
    const isNumeric = /^\d+$/.test(slug);
    
    let board: Board | null = null;
    
    if (isNumeric) {
      // ID로 조회
      board = await dbQuery.get<Board>(
        'SELECT * FROM boards WHERE id = $1',
        [parseInt(slug, 10)]
      );
    } else {
      // slug로 조회
      board = await dbQuery.get<Board>(
        'SELECT * FROM boards WHERE slug = $1',
        [slug]
      );
    }
    
    console.log('Board query result:', board);

    if (!board) {
      console.log('Board not found for slug/id:', slug);
      return NextResponse.json(
        { error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error: any) {
    console.error('Failed to fetch board:', error);
    console.error('Error details:', error.message, error.stack);
    return NextResponse.json(
      { error: '게시판 조회 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/boards/[slug] - 게시판 수정 (ID 또는 slug로 접근 가능)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('PUT request for board:', slug);
    
    // slug가 숫자인지 확인
    const isNumeric = /^\d+$/.test(slug);
    let boardId: number;
    
    if (isNumeric) {
      boardId = parseInt(slug, 10);
    } else {
      // slug로 ID 찾기
      const board = await dbQuery.get<{ id: number }>('SELECT id FROM boards WHERE slug = $1', [slug]);
      if (!board) {
        return NextResponse.json({ error: '게시판을 찾을 수 없습니다' }, { status: 404 });
      }
      boardId = board.id;
    }
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, slug: newSlug, description, type } = body;

    if (!name || !newSlug) {
      console.error('Missing required fields:', { name, slug: newSlug });
      return NextResponse.json(
        { error: '게시판 이름과 URL은 필수입니다' },
        { status: 400 }
      );
    }

    // slug 중복 확인 (자기 자신 제외)
    console.log('Checking for duplicate slug:', newSlug, 'excluding ID:', boardId);
    const existingBoard = await dbQuery.get<Board>(
      'SELECT id FROM boards WHERE slug = $1 AND id != $2',
      [newSlug, boardId]
    );

    if (existingBoard) {
      console.error('Duplicate slug found:', existingBoard);
      return NextResponse.json(
        { error: '이미 사용 중인 URL입니다' },
        { status: 400 }
      );
    }

    // 게시판 업데이트
    console.log('Updating board:', { name, slug: newSlug, description, type: type || 'list', boardId });
    await dbQuery.run(
      `UPDATE boards 
       SET name = $1, slug = $2, description = $3, type = $4
       WHERE id = $5`,
      [name, newSlug, description || null, type || 'list', boardId]
    );

    console.log('Fetching updated board...');
    const updatedBoard = await dbQuery.get<Board>(
      'SELECT * FROM boards WHERE id = $1',
      [boardId]
    );

    console.log('Updated board:', updatedBoard);
    return NextResponse.json(updatedBoard);
  } catch (error: any) {
    console.error('Failed to update board - Full error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { error: '게시판 수정 중 오류가 발생했습니다', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/boards/[slug] - 게시판 삭제 (ID 또는 slug로 접근 가능)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // slug가 숫자인지 확인
    const isNumeric = /^\d+$/.test(slug);
    let boardId: number;
    
    if (isNumeric) {
      boardId = parseInt(slug, 10);
    } else {
      // slug로 ID 찾기
      const board = await dbQuery.get<{ id: number }>('SELECT id FROM boards WHERE slug = $1', [slug]);
      if (!board) {
        return NextResponse.json({ error: '게시판을 찾을 수 없습니다' }, { status: 404 });
      }
      boardId = board.id;
    }

    // 게시판 존재 확인
    const board = await dbQuery.get<Board>(
      'SELECT id FROM boards WHERE id = $1',
      [boardId]
    );

    if (!board) {
      return NextResponse.json(
        { error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 관련 게시글도 함께 삭제 (CASCADE 설정이 없다면)
    await dbQuery.run('DELETE FROM posts WHERE board_id = $1', [boardId]);
    
    // 게시판 삭제
    await dbQuery.run('DELETE FROM boards WHERE id = $1', [boardId]);

    return NextResponse.json({ message: '게시판이 삭제되었습니다' });
  } catch (error) {
    console.error('Failed to delete board:', error);
    return NextResponse.json(
      { error: '게시판 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}