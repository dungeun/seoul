import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/solar-data/[id] - 태양광 데이터 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/solar-data/${id}`, {
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch solar data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching solar data:', error);
    return NextResponse.json(
      { error: error.message || '태양광 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/solar-data/[id] - 태양광 데이터 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/solar-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update solar data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating solar data:', error);
    return NextResponse.json(
      { error: error.message || '태양광 데이터 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/solar-data/[id] - 태양광 데이터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/solar-data/${id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete solar data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting solar data:', error);
    return NextResponse.json(
      { error: error.message || '태양광 데이터 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}