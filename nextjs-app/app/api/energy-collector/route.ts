import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

// 에너지 데이터 수집 API - 외부 시스템에서 데이터를 가져와 DB에 저장
export async function POST(request: Request) {
  try {
    // 인증 검증 (선택사항 - 내부 호출만 허용)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 현재 시간 정보
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // 외부 에너지 모니터링 시스템에서 데이터 가져오기
    // 실제 구현시 실제 API 엔드포인트로 변경 필요
    const externalApiUrl = process.env.ENERGY_MONITOR_API_URL || 'https://energy-api.example.com';
    
    try {
      // 외부 API 호출 (예시)
      const response = await fetch(`${externalApiUrl}/current-readings`, {
        headers: {
          'Authorization': `Bearer ${process.env.ENERGY_MONITOR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      const externalData = await response.json();

      // 데이터 변환 및 저장
      const savedData = [];
      
      for (const building of externalData.buildings) {
        // 중복 체크 - 같은 건물, 년, 월 데이터가 있는지 확인
        const existing = await dbQuery.get(
          `SELECT id FROM energy_data 
           WHERE building_name = $1 AND year = $2 AND month = $3`,
          [building.name, year, month]
        );

        if (existing) {
          // 기존 데이터 업데이트
          await dbQuery.run(
            `UPDATE energy_data 
             SET electricity = $1, gas = $2, water = $3, updated_at = CURRENT_TIMESTAMP
             WHERE building_name = $4 AND year = $5 AND month = $6`,
            [
              building.electricity || 0,
              building.gas || 0,
              building.water || 0,
              building.name,
              year,
              month
            ]
          );
          savedData.push({ building: building.name, action: 'updated' });
        } else {
          // 새 데이터 삽입
          await dbQuery.run(
            `INSERT INTO energy_data (building_name, year, month, electricity, gas, water)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              building.name,
              year,
              month,
              building.electricity || 0,
              building.gas || 0,
              building.water || 0
            ]
          );
          savedData.push({ building: building.name, action: 'created' });
        }
      }

      // 수집 로그 저장
      await dbQuery.run(
        `INSERT INTO energy_collection_logs (collected_at, status, data_count, details)
         VALUES ($1, $2, $3, $4)`,
        [
          new Date(),
          'success',
          savedData.length,
          JSON.stringify({ savedData, source: 'external_api' })
        ]
      );

      return NextResponse.json({
        success: true,
        message: `Successfully collected data for ${savedData.length} buildings`,
        timestamp: new Date().toISOString(),
        data: savedData
      });

    } catch (apiError) {
      // 외부 API 오류시 더미 데이터로 테스트 (개발용)
      if (process.env.NODE_ENV === 'development') {
        const testBuildings = ['공학관', '자연과학관', '도서관'];
        const savedData = [];

        for (const buildingName of testBuildings) {
          const existing = await dbQuery.get(
            `SELECT id FROM energy_data 
             WHERE building_name = $1 AND year = $2 AND month = $3`,
            [buildingName, year, month]
          );

          const testData = {
            electricity: Math.floor(Math.random() * 10000) + 5000,
            gas: Math.floor(Math.random() * 5000) + 1000,
            water: Math.floor(Math.random() * 1000) + 100
          };

          if (existing) {
            await dbQuery.run(
              `UPDATE energy_data 
               SET electricity = $1, gas = $2, water = $3, updated_at = CURRENT_TIMESTAMP
               WHERE building_name = $4 AND year = $5 AND month = $6`,
              [testData.electricity, testData.gas, testData.water, buildingName, year, month]
            );
            savedData.push({ building: buildingName, action: 'updated', data: testData });
          } else {
            await dbQuery.run(
              `INSERT INTO energy_data (building_name, year, month, electricity, gas, water)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [buildingName, year, month, testData.electricity, testData.gas, testData.water]
            );
            savedData.push({ building: buildingName, action: 'created', data: testData });
          }
        }

        return NextResponse.json({
          success: true,
          message: `Test mode: Generated data for ${savedData.length} buildings`,
          timestamp: new Date().toISOString(),
          data: savedData
        });
      }

      throw apiError;
    }

  } catch (error) {
    console.error('Energy collection error:', error);
    
    // 오류 로그 저장
    await dbQuery.run(
      `INSERT INTO energy_collection_logs (collected_at, status, error_message)
       VALUES ($1, $2, $3)`,
      [
        new Date(),
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      ]
    ).catch(console.error);

    return NextResponse.json(
      { error: 'Failed to collect energy data' },
      { status: 500 }
    );
  }
}

// 수집 상태 확인
export async function GET() {
  try {
    // 최근 수집 로그 조회
    const recentLogs = await dbQuery.all(
      `SELECT * FROM energy_collection_logs 
       ORDER BY collected_at DESC 
       LIMIT 10`
    );

    // 마지막 성공적인 수집 시간
    const lastSuccess = await dbQuery.get<{ collected_at: string }>(
      `SELECT collected_at FROM energy_collection_logs 
       WHERE status = 'success' 
       ORDER BY collected_at DESC 
       LIMIT 1`
    );

    return NextResponse.json({
      lastSuccessfulCollection: lastSuccess?.collected_at || null,
      recentLogs,
      nextScheduledCollection: getNextScheduledTime()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch collection status' },
      { status: 500 }
    );
  }
}

// 다음 수집 예정 시간 계산
function getNextScheduledTime() {
  const now = new Date();
  const next = new Date(now);
  
  // 매시간 정각에 실행 예정
  next.setHours(now.getHours() + 1);
  next.setMinutes(0);
  next.setSeconds(0);
  next.setMilliseconds(0);
  
  return next.toISOString();
}