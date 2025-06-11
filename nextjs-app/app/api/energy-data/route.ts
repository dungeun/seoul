import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/energy-data - 에너지 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '';
    const month = searchParams.get('month') || '';
    const building = searchParams.get('building') || '';

    const cookie = request.headers.get('cookie');
    
    const queryParams = new URLSearchParams({
      ...(year && { year }),
      ...(month && { month }),
      ...(building && { building })
    });

    const response = await fetch(`${API_BASE_URL}/api/energy-data?${queryParams}`, {
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch energy data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching energy data:', error);
    return NextResponse.json(
      { error: error.message || '에너지 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/energy-data - 에너지 데이터 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/energy-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create energy data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error creating energy data:', error);
    return NextResponse.json(
      { error: error.message || '에너지 데이터 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}