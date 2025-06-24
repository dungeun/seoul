import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface ResearcherScreenshot {
  id: number;
  researcher_name: string;
  screenshot_url: string;
  original_url?: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET: 모든 연구진 스크린샷 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    const sql = includeInactive 
      ? 'SELECT * FROM researcher_screenshots ORDER BY order_index, id'
      : 'SELECT * FROM researcher_screenshots WHERE is_active = true ORDER BY order_index, id';
    
    const screenshots = await dbQuery.all<ResearcherScreenshot>(sql);
    
    return NextResponse.json({
      success: true,
      data: screenshots
    });
  } catch (error) {
    console.error('Error fetching researcher screenshots:', error);
    return NextResponse.json(
      { error: '연구진 스크린샷 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 새 연구진 스크린샷 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { researcher_name, screenshot_url, original_url, description, order_index = 0 } = body;
    
    if (!researcher_name || !screenshot_url) {
      return NextResponse.json(
        { error: '연구진 이름과 스크린샷 URL은 필수입니다.' },
        { status: 400 }
      );
    }
    
    const sql = `
      INSERT INTO researcher_screenshots 
      (researcher_name, screenshot_url, original_url, description, order_index) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    
    const values = [researcher_name, screenshot_url, original_url, description, order_index];
    const result = await dbQuery.get<ResearcherScreenshot>(sql, values);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating researcher screenshot:', error);
    return NextResponse.json(
      { error: '연구진 스크린샷 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT: 연구진 스크린샷 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, researcher_name, screenshot_url, original_url, description, order_index, is_active } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (researcher_name !== undefined) {
      updates.push(`researcher_name = $${paramCount++}`);
      values.push(researcher_name);
    }
    if (screenshot_url !== undefined) {
      updates.push(`screenshot_url = $${paramCount++}`);
      values.push(screenshot_url);
    }
    if (original_url !== undefined) {
      updates.push(`original_url = $${paramCount++}`);
      values.push(original_url);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
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
        { error: '업데이트할 필드가 없습니다.' },
        { status: 400 }
      );
    }
    
    values.push(id);
    const sql = `
      UPDATE researcher_screenshots 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;
    
    const result = await dbQuery.get<ResearcherScreenshot>(sql, values);
    
    if (!result) {
      return NextResponse.json(
        { error: '해당 ID의 연구진 스크린샷을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error updating researcher screenshot:', error);
    return NextResponse.json(
      { error: '연구진 스크린샷 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 연구진 스크린샷 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const sql = 'DELETE FROM researcher_screenshots WHERE id = $1 RETURNING *';
    const result = await dbQuery.get<ResearcherScreenshot>(sql, [id]);
    
    if (!result) {
      return NextResponse.json(
        { error: '해당 ID의 연구진 스크린샷을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '연구진 스크린샷이 삭제되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('Error deleting researcher screenshot:', error);
    return NextResponse.json(
      { error: '연구진 스크린샷 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}