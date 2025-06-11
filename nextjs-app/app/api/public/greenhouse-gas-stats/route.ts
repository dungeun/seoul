import { NextRequest, NextResponse } from 'next/server';

// GET /api/public/greenhouse-gas-stats - 공개용 온실가스 통계
export async function GET(_request: NextRequest) {
  try {
    // 더미 데이터 반환
    const data = {
      success: true,
      data: {
        currentYear: 2024,
        totalEmission: 8765,
        previousYearEmission: 9234,
        reductionAmount: 469,
        reductionRate: 5.08,
        monthlyEmissions: [
          { month: '1월', emission: 876 },
          { month: '2월', emission: 765 },
          { month: '3월', emission: 654 },
          { month: '4월', emission: 543 },
          { month: '5월', emission: 432 },
          { month: '6월', emission: 321 }
        ],
        yearlyTrend: [
          { year: 2020, emission: 10234 },
          { year: 2021, emission: 9876 },
          { year: 2022, emission: 9543 },
          { year: 2023, emission: 9234 },
          { year: 2024, emission: 8765 }
        ],
        buildingEmissions: [
          { name: '공과대학 301동', value: 1234 },
          { name: '중앙도서관', value: 987 },
          { name: '학생회관', value: 765 },
          { name: '기숙사 A동', value: 654 },
          { name: '공과대학 302동', value: 543 }
        ],
      },
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Greenhouse gas stats fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '온실가스 통계 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
} 