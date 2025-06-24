import { NextRequest } from 'next/server';
import { dbQuery } from '@/lib/database';

interface YearlyEmissionData {
  total_electricity: number;
  total_gas: number;
}

// GET /api/realtime/sse - Server-Sent Events 실시간 데이터 스트림
export async function GET(request: NextRequest) {
  // ReadableStream을 사용한 SSE 구현
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // 헬스체크 메시지 전송
      const sendHeartbeat = () => {
        const heartbeat = `data: ${JSON.stringify({
          type: 'heartbeat',
          timestamp: new Date().toISOString(),
        })}\n\n`;
        
        controller.enqueue(encoder.encode(heartbeat));
      };

      // 실시간 에너지 데이터 전송
      const sendEnergyData = async () => {
        try {
          // 최근 데이터 조회 (최근 1시간 또는 최신 10개)
          const recentEnergyData = await dbQuery.all(`
            SELECT 
              building_name,
              year,
              month,
              electricity,
              gas,
              water,
              created_at
            FROM energy_data 
            WHERE created_at > NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC
            LIMIT 10
          `);

          // 데이터가 없으면 최신 데이터라도 가져오기
          const dataToSend = recentEnergyData.length > 0 ? recentEnergyData : 
            await dbQuery.all(`
              SELECT 
                building_name,
                year,
                month,
                electricity,
                gas,
                water,
                created_at
              FROM energy_data 
              ORDER BY year DESC, month DESC
              LIMIT 10
            `);

          if (dataToSend.length > 0) {
            const message = `data: ${JSON.stringify({
              type: 'energy_update',
              timestamp: new Date().toISOString(),
              data: dataToSend,
            })}\n\n`;
            
            controller.enqueue(encoder.encode(message));
          }
        } catch (error: any) {
          console.error('SSE energy data error:', error);
          // 데이터베이스 연결 오류 시에도 빈 데이터 전송
          const message = `data: ${JSON.stringify({
            type: 'energy_update',
            timestamp: new Date().toISOString(),
            data: [],
            error: 'Database temporarily unavailable'
          })}\n\n`;
          
          controller.enqueue(encoder.encode(message));
        }
      };

      // 실시간 태양광 데이터 전송
      const sendSolarData = async () => {
        try {
          const recentSolarData = await dbQuery.all(`
            SELECT 
              building_name,
              year,
              month,
              generation,
              capacity,
              created_at
            FROM solar_data 
            WHERE created_at > NOW() - INTERVAL '1 hour'
            ORDER BY created_at DESC
            LIMIT 10
          `);

          // 데이터가 없으면 최신 데이터라도 가져오기
          const dataToSend = recentSolarData.length > 0 ? recentSolarData : 
            await dbQuery.all(`
              SELECT 
                building_name,
                year,
                month,
                generation,
                capacity,
                created_at
              FROM solar_data 
              ORDER BY year DESC, month DESC
              LIMIT 10
            `);

          if (dataToSend.length > 0) {
            const message = `data: ${JSON.stringify({
              type: 'solar_update',
              timestamp: new Date().toISOString(),
              data: dataToSend,
            })}\n\n`;
            
            controller.enqueue(encoder.encode(message));
          }
        } catch (error: any) {
          console.error('SSE solar data error:', error);
          // 데이터베이스 연결 오류 시에도 빈 데이터 전송
          const message = `data: ${JSON.stringify({
            type: 'solar_update',
            timestamp: new Date().toISOString(),
            data: [],
            error: 'Database temporarily unavailable'
          })}\n\n`;
          
          controller.enqueue(encoder.encode(message));
        }
      };

      // 온실가스 통계 업데이트 전송
      const sendGreenhouseStats = async () => {
        try {
          const currentYear = new Date().getFullYear();
          
          // 현재 연도 데이터
          const currentYearData = await dbQuery.get<YearlyEmissionData>(` 
            SELECT 
              SUM(electricity) as total_electricity,
              SUM(gas) as total_gas
            FROM energy_data 
            WHERE year = $1
          `, [currentYear]);

          if (currentYearData) {
            // 온실가스 배출량 계산 (전기: 0.4781 kgCO2/kWh, 가스: 2.176 kgCO2/m³)
            const totalEmission = (currentYearData.total_electricity * 0.4781) + 
                                 (currentYearData.total_gas * 2.176);

            const message = `data: ${JSON.stringify({
              type: 'greenhouse_update',
              timestamp: new Date().toISOString(),
              data: {
                totalEmission: Math.round(totalEmission),
                electricityEmission: Math.round(currentYearData.total_electricity * 0.4781),
                gasEmission: Math.round(currentYearData.total_gas * 2.176),
              },
            })}\n\n`;
            
            controller.enqueue(encoder.encode(message));
          }
        } catch (error: any) {
          console.error('SSE greenhouse stats error:', error);
          // 데이터베이스 연결 오류 시에도 빈 데이터 전송
          const message = `data: ${JSON.stringify({
            type: 'greenhouse_update',
            timestamp: new Date().toISOString(),
            data: {
              totalEmission: 0,
              electricityEmission: 0,
              gasEmission: 0,
            },
            error: 'Database temporarily unavailable'
          })}\n\n`;
          
          controller.enqueue(encoder.encode(message));
        }
      };

      // 초기 데이터 전송
      sendEnergyData();
      sendSolarData();
      sendGreenhouseStats();

      // 주기적 업데이트 설정
      const heartbeatInterval = setInterval(sendHeartbeat, 30000); // 30초마다 heartbeat
      const energyInterval = setInterval(sendEnergyData, 60000);   // 1분마다 에너지 데이터
      const solarInterval = setInterval(sendSolarData, 60000);     // 1분마다 태양광 데이터
      const greenhouseInterval = setInterval(sendGreenhouseStats, 120000); // 2분마다 온실가스 통계

      // 연결 종료 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        clearInterval(energyInterval);
        clearInterval(solarInterval);
        clearInterval(greenhouseInterval);
        controller.close();
      });

      // 에러 발생 시 정리
      controller.error = (error) => {
        console.error('SSE stream error:', error);
        clearInterval(heartbeatInterval);
        clearInterval(energyInterval);
        clearInterval(solarInterval);
        clearInterval(greenhouseInterval);
      };
    },
  });

  // SSE 응답 헤더 설정
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}