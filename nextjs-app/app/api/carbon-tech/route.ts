import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const posts = await dbQuery.all(`
      SELECT * FROM carbon_tech_posts 
      ORDER BY main_category, sub_category, order_index, name
    `);
    
    return NextResponse.json(posts || []);
  } catch (error) {
    console.error('Error fetching carbon tech posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();
    const { name, department, url, screenshot_url, main_category, sub_category, order_index, status } = data;

    // 필수 필드 검증
    if (!name || !department || !url || !main_category || !sub_category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 중복 URL 체크
    const existing = await dbQuery.get(
      'SELECT id FROM carbon_tech_posts WHERE url = $1',
      [url]
    );

    if (existing) {
      return NextResponse.json(
        { error: 'URL already exists' },
        { status: 400 }
      );
    }

    // 데이터 삽입
    const result = await dbQuery.run(
      `INSERT INTO carbon_tech_posts 
      (name, department, url, screenshot_url, main_category, sub_category, order_index, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [name, department, url, screenshot_url || null, main_category, sub_category, order_index || 0, status || 'published']
    );

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating carbon tech post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}