import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 전기 사용량 통계
    const [currentElectricity, lastElectricity] = await Promise.all([
      dbQuery.get<{ total: number }>(`
        SELECT SUM(electricity) as total 
        FROM energy_data 
        WHERE year = $1 AND month = $2
      `, [currentYear, currentMonth]),
      dbQuery.get<{ total: number }>(`
        SELECT SUM(electricity) as total 
        FROM energy_data 
        WHERE year = $1 AND month = $2
      `, [lastMonthYear, lastMonth])
    ]);

    // 태양광 발전량 통계
    const [currentSolar, lastSolar] = await Promise.all([
      dbQuery.get<{ total: number }>(`
        SELECT SUM(generation) as total 
        FROM solar_data 
        WHERE year = $1 AND month = $2
      `, [currentYear, currentMonth]),
      dbQuery.get<{ total: number }>(`
        SELECT SUM(generation) as total 
        FROM solar_data 
        WHERE year = $1 AND month = $2
      `, [lastMonthYear, lastMonth])
    ]);

    // 온실가스 배출량 계산 (전기 + 가스)
    const [currentEmissions, lastEmissions] = await Promise.all([
      dbQuery.get<{ electricity: number; gas: number }>(`
        SELECT 
          SUM(electricity) as electricity,
          SUM(gas) as gas
        FROM energy_data 
        WHERE year = $1 AND month = $2
      `, [currentYear, currentMonth]),
      dbQuery.get<{ electricity: number; gas: number }>(`
        SELECT 
          SUM(electricity) as electricity,
          SUM(gas) as gas
        FROM energy_data 
        WHERE year = $1 AND month = $2
      `, [lastMonthYear, lastMonth])
    ]);

    // 관리 건물 수
    const buildingCount = await dbQuery.get<{ count: number }>(`
      SELECT COUNT(DISTINCT building_name) as count 
      FROM energy_data
    `);

    // 월별 에너지 사용량 (최근 12개월)
    const monthlyEnergy = await dbQuery.all<{
      year: number;
      month: number;
      electricity: number;
      gas: number;
      water: number;
    }>(`
      SELECT 
        year,
        month,
        SUM(electricity) as electricity,
        SUM(gas) as gas,
        SUM(water) as water
      FROM energy_data
      WHERE 
        (year = $1 AND month <= $2) OR 
        (year = $3 AND month > $2)
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [currentYear, currentMonth, currentYear - 1, currentMonth]);

    // 월별 태양광 발전량 (최근 12개월)
    const monthlySolar = await dbQuery.all<{
      year: number;
      month: number;
      generation: number;
    }>(`
      SELECT 
        year,
        month,
        SUM(generation) as generation
      FROM solar_data
      WHERE 
        (year = $1 AND month <= $2) OR 
        (year = $3 AND month > $2)
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [currentYear, currentMonth, currentYear - 1, currentMonth]);

    // 온실가스 배출 계수 (전기: 0.4781 kgCO2/kWh, 가스: 2.176 kgCO2/m³)
    const currentCO2 = currentEmissions 
      ? (currentEmissions.electricity || 0) * 0.4781 + (currentEmissions.gas || 0) * 2.176 
      : 0;
    const lastCO2 = lastEmissions 
      ? (lastEmissions.electricity || 0) * 0.4781 + (lastEmissions.gas || 0) * 2.176 
      : 0;

    // 변화율 계산
    const electricityChange = lastElectricity?.total 
      ? ((currentElectricity?.total || 0) - lastElectricity.total) / lastElectricity.total * 100 
      : 0;
    const solarChange = lastSolar?.total 
      ? ((currentSolar?.total || 0) - lastSolar.total) / lastSolar.total * 100 
      : 0;
    const co2Change = lastCO2 
      ? (currentCO2 - lastCO2) / lastCO2 * 100 
      : 0;

    // 최근 활동
    const recentActivities = await dbQuery.all<{
      type: string;
      building_name: string;
      created_at: string;
    }>(`
      (
        SELECT 'energy' as type, building_name, created_at 
        FROM energy_data 
        ORDER BY created_at DESC 
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'solar' as type, building_name, created_at 
        FROM solar_data 
        ORDER BY created_at DESC 
        LIMIT 5
      )
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      stats: {
        electricity: {
          value: currentElectricity?.total || 0,
          change: electricityChange,
          unit: 'kWh'
        },
        solar: {
          value: currentSolar?.total || 0,
          change: solarChange,
          unit: 'kWh'
        },
        greenhouse: {
          value: Math.round(currentCO2 / 1000), // kg to ton
          change: co2Change,
          unit: 'tCO₂eq'
        },
        buildings: {
          value: buildingCount?.count || 0,
          change: 0,
          unit: '개'
        }
      },
      charts: {
        monthlyEnergy: monthlyEnergy.reverse(),
        monthlySolar: monthlySolar.reverse(),
        monthlyEmissions: monthlyEnergy.reverse().map(item => ({
          year: item.year,
          month: item.month,
          emissions: Math.round(((item.electricity * 0.4781) + (item.gas * 2.176)) / 1000)
        }))
      },
      recentActivities
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json({ error: '통계를 불러오는데 실패했습니다' }, { status: 500 });
  }
}