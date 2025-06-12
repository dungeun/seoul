import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { EnergyData } from '@/types';

// PUT /api/energy/[id] - 에너지 데이터 수정
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
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

    // 기존 데이터 확인
    const existing = await dbQuery.get<EnergyData>(
      'SELECT * FROM energy_data WHERE id = $1',
      [Number(id)]
    );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: '해당 데이터를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 데이터 업데이트
    await dbQuery.run(
      `UPDATE energy_data 
       SET building_name = $1, year = $2, month = $3, 
           electricity = $4, gas = $5, water = $6
       WHERE id = $7`,
      [building_name, year, month, electricity || 0, gas || 0, water || 0, Number(id)]
    );

    return NextResponse.json({
      success: true,
      message: '에너지 데이터가 수정되었습니다.',
    });
  } catch (error) {
    console.error('Energy data update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '에너지 데이터 수정 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/energy/[id] - 에너지 데이터 삭제
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    // 기존 데이터 확인
    const existing = await dbQuery.get<EnergyData>(
      'SELECT * FROM energy_data WHERE id = $1',
      [Number(id)]
    );

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: '해당 데이터를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 데이터 삭제
    await dbQuery.run('DELETE FROM energy_data WHERE id = $1', [Number(id)]);

    return NextResponse.json({
      success: true,
      message: '에너지 데이터가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Energy data deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '에너지 데이터 삭제 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 