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

// GET /api/solar-data - 태양광 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const building = searchParams.get('building');

    let query = 'SELECT * FROM solar_data WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (year) {
      query += ` AND year = $${paramIndex++}`;
      params.push(parseInt(year));
    }

    if (month) {
      query += ` AND month = $${paramIndex++}`;
      params.push(parseInt(month));
    }

    if (building) {
      query += ` AND building_name = $${paramIndex++}`;
      params.push(building);
    }

    query += ' ORDER BY year DESC, month DESC, building_name ASC';

    const data = await dbQuery.all<SolarData>(query, params);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching solar data:', error);
    return NextResponse.json(
      { error: '태양광 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/solar-data - 태양광 데이터 생성
export async function POST(request: NextRequest) {
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

    // 기존 데이터 확인
    const existing = await dbQuery.get<SolarData>(
      'SELECT id FROM solar_data WHERE building_name = $1 AND year = $2 AND month = $3',
      [building_name, year, month]
    );

    if (existing) {
      return NextResponse.json(
        { error: '동일한 건물의 해당 연월 데이터가 이미 존재합니다.' },
        { status: 409 }
      );
    }

    // 데이터 삽입
    const result = await dbQuery.run(
      `INSERT INTO solar_data (building_name, year, month, generation, self_consumption, trade, capacity, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [building_name, year, month, generation || 0, self_consumption || 0, trade || 0, capacity || 0, new Date().toISOString()]
    );

    const newData = await dbQuery.get<SolarData>(
      'SELECT * FROM solar_data WHERE id = $1',
      [result.rows[0]?.id]
    );

    return NextResponse.json(newData, { status: 201 });
  } catch (error: any) {
    console.error('Error creating solar data:', error);
    return NextResponse.json(
      { error: '태양광 데이터 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}