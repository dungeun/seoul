import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Board {
  id: number;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  board_id: number;
  category_id?: number;
  view_count: number;
  created_at: string;
  thumbnail_url?: string;
  featured_image?: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // 먼저 게시판 정보 조회
    const board = await dbQuery.get<Board>(
      'SELECT id, slug FROM boards WHERE slug = $1',
      [slug]
    );

    if (!board) {
      return NextResponse.json(
        { error: '게시판을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 게시글 목록 조회
    const posts = await dbQuery.all<Post>(
      `SELECT * FROM posts 
       WHERE board_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [board.id, limit, offset]
    );

    // 전체 게시글 수 조회
    const countResult = await dbQuery.get<{ total: number }>(
      'SELECT COUNT(*) as total FROM posts WHERE board_id = $1',
      [board.id]
    );

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json(
      { error: '게시글 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}