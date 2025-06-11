import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { EnergyData } from '@/types';

// GET /api/energy - 에너지 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const building = searchParams.get('building');

    let query = 'SELECT * FROM energy_data WHERE 1=1';
    const params: unknown[] = [];

    if (year) {
      query += ' AND year = ?';
      params.push(Number(year));
    }

    if (month) {
      query += ' AND month = ?';
      params.push(Number(month));
    }

    if (building) {
      query += ' AND building_name = ?';
      params.push(building);
    }

    query += ' ORDER BY year DESC, month DESC, building_name';

    const data = dbQuery.all<EnergyData>(query, params);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Energy data fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '에너지 데이터 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// POST /api/energy - 새 에너지 데이터 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { building_name, year, month, electricity, gas, water } = body;

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
    const existing = dbQuery.get<EnergyData>(
      'SELECT * FROM energy_data WHERE building_name = ? AND year = ? AND month = ?',
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
    const result = dbQuery.run(
      `INSERT INTO energy_data 
       (building_name, year, month, electricity, gas, water) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [building_name, year, month, electricity || 0, gas || 0, water || 0]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.lastInsertRowid },
      message: '에너지 데이터가 생성되었습니다.',
    });
  } catch (error) {
    console.error('Energy data creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '에너지 데이터 생성 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 