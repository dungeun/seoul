import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { SolarData } from '@/types';

// GET /api/solar - 태양광 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const building = searchParams.get('building');

    let query = 'SELECT * FROM solar_data WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (year) {
      query += ` AND year = $${paramIndex++}`;
      params.push(Number(year));
    }

    if (month) {
      query += ` AND month = $${paramIndex++}`;
      params.push(Number(month));
    }

    if (building) {
      query += ` AND building_name = $${paramIndex++}`;
      params.push(building);
    }

    query += ' ORDER BY year DESC, month DESC, building_name';

    const data = await dbQuery.all<SolarData>(query, params);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Solar data fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '태양광 데이터 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// POST /api/solar - 새 태양광 데이터 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { building_name, year, month, generation, capacity } = body;

    // 입력 검증
    if (!building_name || !year || !month) {
      return NextResponse.json(
        {
          success: false,
          message: '필수 필드가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 중복 데이터 확인
    const existing = await dbQuery.get<SolarData>(
      'SELECT * FROM solar_data WHERE building_name = $1 AND year = $2 AND month = $3',
      [building_name, year, month]
    );

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: '해당 건물의 해당 년월 데이터가 이미 존재합니다.',
        },
        { status: 409 }
      );
    }

    // 데이터 삽입
    const result = await dbQuery.run(
      `INSERT INTO solar_data 
       (building_name, year, month, generation, capacity) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [building_name, year, month, generation || 0, capacity || 0]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.rows[0]?.id },
      message: '태양광 데이터가 생성되었습니다.',
    });
  } catch (error) {
    console.error('Solar data creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '태양광 데이터 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 