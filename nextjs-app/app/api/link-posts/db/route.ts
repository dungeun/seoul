import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface LinkPost {
  id: number;
  title: string;
  content: string;
  link_url: string;
  image_url?: string;
  main_category: string;
  sub_category: string;
  status: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// OPTIONS /api/link-posts/db - CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// GET /api/link-posts/db - 링크 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const mainCategory = searchParams.get('main_category');
    const subCategory = searchParams.get('sub_category');
    
    let query = 'SELECT * FROM link_posts WHERE 1=1';
    const params: any[] = [];
    
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    
    if (mainCategory) {
      params.push(mainCategory);
      query += ` AND main_category = $${params.length}`;
    }
    
    if (subCategory) {
      params.push(subCategory);
      query += ` AND sub_category = $${params.length}`;
    }
    
    query += ' ORDER BY order_index ASC, created_at DESC';
    
    const posts = await dbQuery.all<LinkPost>(query, params);

    const response = NextResponse.json(posts);
    // CORS 헤더 추가
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (error) {
    console.error('Error fetching link posts:', error);
    const errorResponse = NextResponse.json(
      { error: '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
    // CORS 헤더 추가
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return errorResponse;
  }
}

// POST /api/link-posts/db - 링크 게시글 생성
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const adminToken = request.cookies.get('admin-token')?.value;
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, link_url, image_url, main_category, sub_category, status = 'published', order_index = 0 } = body;

    // 필수 필드 검증
    if (!title || !link_url || !main_category || !sub_category) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 중복 URL 확인
    const existing = await dbQuery.get(
      `SELECT id FROM link_posts WHERE link_url = $1`,
      [link_url]
    );

    if (existing) {
      return NextResponse.json(
        { error: '이미 등록된 URL입니다.' },
        { status: 400 }
      );
    }

    // 새 게시글 생성
    const result = await dbQuery.get<{ id: number }>(
      `INSERT INTO link_posts 
      (title, content, link_url, image_url, main_category, sub_category, status, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [title, content || '', link_url, image_url || null, main_category, sub_category, status, order_index]
    );

    return NextResponse.json({ 
      success: true, 
      id: result?.id,
      message: '링크 게시글이 생성되었습니다.'
    });

  } catch (error) {
    console.error('Error creating link post:', error);
    return NextResponse.json(
      { error: '링크 게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}