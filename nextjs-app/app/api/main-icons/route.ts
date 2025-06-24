import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET - 모든 아이콘 조회
export async function GET() {
  try {
    const db = getDatabase();
    const result = await db.query(
      'SELECT * FROM main_page_icons WHERE is_active = true ORDER BY order_index ASC'
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching main icons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch main icons' },
      { status: 500 }
    );
  }
}

// POST - 새 아이콘 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, icon_image, order_index } = body;

    if (!title || !url || !icon_image) {
      return NextResponse.json(
        { error: 'Title, URL, and icon image are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const result = await db.query(
      `INSERT INTO main_page_icons (title, url, icon_image, order_index) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [title, url, icon_image, order_index || 0]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating main icon:', error);
    return NextResponse.json(
      { error: 'Failed to create main icon' },
      { status: 500 }
    );
  }
}

// PUT - 아이콘 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, icon_image, order_index, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Icon ID is required' },
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
    if (url !== undefined) {
      updates.push(`url = $${paramCount++}`);
      values.push(url);
    }
    if (icon_image !== undefined) {
      updates.push(`icon_image = $${paramCount++}`);
      values.push(icon_image);
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
      `UPDATE main_page_icons 
       SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Icon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating main icon:', error);
    return NextResponse.json(
      { error: 'Failed to update main icon' },
      { status: 500 }
    );
  }
}

// DELETE - 아이콘 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Icon ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const result = await db.query(
      'DELETE FROM main_page_icons WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Icon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Icon deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting main icon:', error);
    return NextResponse.json(
      { error: 'Failed to delete main icon' },
      { status: 500 }
    );
  }
}