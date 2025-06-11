import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'http://localhost:10000';

// GET /api/energy-data/[id] - 에너지 데이터 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/energy-data/${id}`, {
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

// PUT /api/energy-data/[id] - 에너지 데이터 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/energy-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update energy data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating energy data:', error);
    return NextResponse.json(
      { error: error.message || '에너지 데이터 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/energy-data/[id] - 에너지 데이터 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const cookie = request.headers.get('cookie');

    const response = await fetch(`${API_BASE_URL}/api/energy-data/${id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookie || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete energy data: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting energy data:', error);
    return NextResponse.json(
      { error: error.message || '에너지 데이터 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}