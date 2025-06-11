import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/buildings - 건물 목록 조회
export async function GET(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/buildings`, {
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch buildings: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: error.message || '건물 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 