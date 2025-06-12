import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface LinkPost {
  id: number;
  title: string;
  content?: string;
  link_url: string;
  image_url?: string;
  main_category?: string;
  sub_category?: string;
  status: string;
  created_at: string;
}

// GET /api/public/link-posts - 공개 링크 게시글 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const main_category = searchParams.get('main_category');
    const sub_category = searchParams.get('sub_category');

    let query = `
      SELECT * FROM link_posts 
      WHERE status = 'published'
    `;
    const params: string[] = [];
    let paramIndex = 1;

    if (main_category) {
      query += ` AND main_category = $${paramIndex++}`;
      params.push(main_category);
    }

    if (sub_category) {
      query += ` AND sub_category = $${paramIndex++}`;
      params.push(sub_category);
    }

    query += ' ORDER BY created_at DESC';

    const linkPosts = await dbQuery.all<LinkPost>(query, params);
    return NextResponse.json(linkPosts);
  } catch (error: any) {
    console.error('Error fetching public link posts:', error);
    return NextResponse.json(
      { error: '링크 게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}