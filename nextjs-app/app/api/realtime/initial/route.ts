import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// 초기 데이터 로드 API
export async function GET() {
  try {
    // 최근 에너지 데이터 가져오기
    const energyData = await dbQuery.all(`
      SELECT 
        e.id,
        e.building_name,
        e.year,
        e.month,
        e.electricity,
        e.gas,
        e.water,
        e.created_at,
        b.name as building_display_name
      FROM energy_data e
      LEFT JOIN buildings b ON e.building_id = b.id
      ORDER BY e.year DESC, e.month DESC, e.building_name
      LIMIT 20
    `);

    // 최근 태양광 데이터 가져오기
    const solarData = await dbQuery.all(`
      SELECT 
        s.id,
        s.building_name,
        s.year,
        s.month,
        s.generation,
        s.capacity,
        s.created_at,
        b.name as building_display_name
      FROM solar_data s
      LEFT JOIN buildings b ON s.building_id = b.id
      ORDER BY s.year DESC, s.month DESC, s.building_name
      LIMIT 20
    `);

    // 온실가스 통계 계산
    const currentYear = new Date().getFullYear();
    const emissionStats = await dbQuery.get<any>(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        COUNT(DISTINCT building_name) as building_count
      FROM energy_data 
      WHERE year = $1
    `, [currentYear]);

    // 이전 연도 데이터 (비교용)
    const previousYearStats = await dbQuery.get<any>(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas
      FROM energy_data 
      WHERE year = $1
    `, [currentYear - 1]);

    // 온실가스 배출량 계산 (전기: 0.4781 kgCO2/kWh, 가스: 2.176 kgCO2/m³)
    const currentEmission = emissionStats ? 
      (emissionStats.total_electricity * 0.4781 + emissionStats.total_gas * 2.176) / 1000 : 0;
    
    const previousEmission = previousYearStats ? 
      (previousYearStats.total_electricity * 0.4781 + previousYearStats.total_gas * 2.176) / 1000 : 0;

    const reductionRate = previousEmission > 0 ? 
      ((previousEmission - currentEmission) / previousEmission * 100) : 0;

    // 월별 트렌드 데이터
    const monthlyTrend = await dbQuery.all(`
      SELECT 
        month,
        SUM(electricity) as electricity,
        SUM(gas) as gas,
        SUM(water) as water
      FROM energy_data
      WHERE year = $1
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `, [currentYear]);

    // 건물별 최신 데이터
    const buildingLatest = await dbQuery.all(`
      SELECT DISTINCT ON (building_name)
        building_name,
        electricity,
        gas,
        water,
        year,
        month
      FROM energy_data
      ORDER BY building_name, year DESC, month DESC
    `);

    return NextResponse.json({
      success: true,
      data: {
        energy: energyData,
        solar: solarData,
        stats: {
          totalElectricity: emissionStats?.total_electricity || 0,
          totalGas: emissionStats?.total_gas || 0,
          totalSolar: solarData.reduce((sum: number, item: any) => sum + (item.generation || 0), 0),
          totalEmission: currentEmission,
          reductionRate: reductionRate.toFixed(1),
          buildingCount: emissionStats?.building_count || 0
        },
        monthlyTrend,
        buildingLatest,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Initial data loading error:', error);
    return NextResponse.json(
      { error: 'Failed to load initial data' },
      { status: 500 }
    );
  }
}