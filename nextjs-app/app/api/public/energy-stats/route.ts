import { NextRequest, NextResponse } from 'next/server';

// GET /api/public/energy-stats - 공개용 에너지 통계
export async function GET(_request: NextRequest) {
  try {
    // 더미 데이터 반환
    const data = {
      success: true,
      data: {
        currentYear: 2024,
        totals: { 
          total_electricity: 15234567, 
          total_gas: 8765432, 
          total_water: 345678 
        },
        previousYearTotals: { 
          total_electricity: 16234567, 
          total_gas: 9765432, 
          total_water: 365678 
        },
        monthlyUsage: [
          { month: 1, electricity: 1234567, gas: 876543, water: 34567 },
          { month: 2, electricity: 1345678, gas: 765432, water: 33456 },
          { month: 3, electricity: 1456789, gas: 654321, water: 32345 },
          { month: 4, electricity: 1234567, gas: 543210, water: 31234 },
          { month: 5, electricity: 1123456, gas: 432109, water: 30123 },
          { month: 6, electricity: 1012345, gas: 321098, water: 29012 }
        ],
        solarGeneration: [
          { month: 1, generation: 234567 },
          { month: 2, generation: 245678 },
          { month: 3, generation: 256789 },
          { month: 4, generation: 267890 },
          { month: 5, generation: 278901 },
          { month: 6, generation: 289012 }
        ],
        solarTotal: 3456789,
        efficiency: {
          electricity: 6.16,
          gas: 10.26,
          water: 5.47
        },
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Energy stats fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '에너지 통계 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 