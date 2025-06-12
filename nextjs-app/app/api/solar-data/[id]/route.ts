import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { verifyAuth } from '@/lib/auth';

interface SolarData {
  id: number;
  building_name: string;
  year: number;
  month: number;
  generation: number;
  self_consumption: number;
  trade?: number;
  capacity?: number;
  created_at?: string;
}

// GET /api/solar-data/[id] - 태양광 데이터 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await dbQuery.get<SolarData>(
      'SELECT * FROM solar_data WHERE id = $1',
      [parseInt(id)]
    );

    if (!data) {
      return NextResponse.json(
        { error: '태양광 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching solar data:', error);
    return NextResponse.json(
      { error: '태양광 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/solar-data/[id] - 태양광 데이터 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 인증 확인
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { building_name, year, month, generation, self_consumption, trade, capacity } = body;

    if (!building_name || !year || !month) {
      return NextResponse.json(
        { error: '건물명, 연도, 월은 필수입니다.' },
        { status: 400 }
      );
    }

    // 중복 체크 (자기 자신 제외)
    const existing = await dbQuery.get<SolarData>(
      'SELECT id FROM solar_data WHERE building_name = $1 AND year = $2 AND month = $3 AND id != $4',
      [building_name, year, month, parseInt(id)]
    );

    if (existing) {
      return NextResponse.json(
        { error: '동일한 건물의 해당 연월 데이터가 이미 존재합니다.' },
        { status: 409 }
      );
    }

    // 데이터 업데이트
    await dbQuery.run(
      `UPDATE solar_data 
       SET building_name = $1, year = $2, month = $3, 
           generation = $4, self_consumption = $5, trade = $6, capacity = $7
       WHERE id = $8`,
      [building_name, year, month, generation || 0, self_consumption || 0, trade || 0, capacity || 0, parseInt(id)]
    );

    const updatedData = await dbQuery.get<SolarData>(
      'SELECT * FROM solar_data WHERE id = $1',
      [parseInt(id)]
    );

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('Error updating solar data:', error);
    return NextResponse.json(
      { error: '태양광 데이터 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/solar-data/[id] - 태양광 데이터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 인증 확인
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 데이터 삭제
    await dbQuery.run(
      'DELETE FROM solar_data WHERE id = $1',
      [parseInt(id)]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting solar data:', error);
    return NextResponse.json(
      { error: '태양광 데이터 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}