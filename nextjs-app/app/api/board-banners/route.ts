import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET - 게시판별 배너 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get('board_id');
    
    const db = getDatabase();
    let query = 'SELECT * FROM board_banners';
    const params = [];
    
    if (boardId) {
      query += ' WHERE board_id = $1';
      params.push(boardId);
    }
    
    query += ' ORDER BY order_index ASC, id ASC';
    
    const result = await db.query(query, params);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching board banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board banners' },
      { status: 500 }
    );
  }
}

// POST - 새 배너 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { board_id, title, subtitle, image_url, link_url, order_index } = body;

    if (!board_id || !title || !image_url) {
      return NextResponse.json(
        { error: 'Board ID, title, and image URL are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const result = await db.query(
      `INSERT INTO board_banners (board_id, title, subtitle, image_url, link_url, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [board_id, title, subtitle || null, image_url, link_url || null, order_index || 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating board banner:', error);
    return NextResponse.json(
      { error: 'Failed to create board banner' },
      { status: 500 }
    );
  }
}

// PUT - 배너 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, image_url, link_url, order_index, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (subtitle !== undefined) {
      updates.push(`subtitle = $${paramCount++}`);
      values.push(subtitle);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (link_url !== undefined) {
      updates.push(`link_url = $${paramCount++}`);
      values.push(link_url);
    }
    if (order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(order_index);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);
    
    const db = getDatabase();
    const result = await db.query(
      `UPDATE board_banners 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating board banner:', error);
    return NextResponse.json(
      { error: 'Failed to update board banner' },
      { status: 500 }
    );
  }
}

// DELETE - 배너 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const result = await db.query(
      'DELETE FROM board_banners WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting board banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete board banner' },
      { status: 500 }
    );
  }
}