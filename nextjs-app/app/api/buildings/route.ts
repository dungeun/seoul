import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface Building {
  id: number;
  name: string;
  code?: string;
  location?: string;
  created_at?: string;
}

// GET /api/buildings - 건물 목록 조회
export async function GET() {
  try {
    // buildings 테이블이 없을 수 있으므로, energy_data와 solar_data에서 unique 건물 목록을 추출
    const buildingNames = await dbQuery.all<{ building_name: string }>(`
      SELECT DISTINCT building_name 
      FROM (
        SELECT building_name FROM energy_data WHERE building_name IS NOT NULL
        UNION
        SELECT building_name FROM solar_data WHERE building_name IS NOT NULL
      ) AS all_buildings
      ORDER BY building_name ASC
    `);

    // 건물 이름을 Building 인터페이스 형태로 변환
    const buildings = buildingNames.map((item, index) => ({
      id: index + 1,
      name: item.building_name,
    }));

    return NextResponse.json(buildings);
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: '건물 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 