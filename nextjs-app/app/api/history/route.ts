import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

interface HistoryItem {
  id: number;
  year: number;
  month?: number | null;
  day?: number | null;
  date_text: string;
  title: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

// GET - 연혁 데이터 조회 (연도별 또는 전체)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');

    if (year) {
      // 특정 연도의 연혁 조회
      const histories = dbQuery.all<HistoryItem>(`
        SELECT id, year, month, day, date_text, title, description, sort_order, created_at 
        FROM history 
        WHERE year = ? 
        ORDER BY sort_order ASC, month ASC
      `, [parseInt(year)]);

      return NextResponse.json(histories);
    } else {
      // 연도별 목록 조회
      const years = dbQuery.all<{ year: number; count: number }>(`
        SELECT year, COUNT(*) as count 
        FROM history 
        GROUP BY year 
        ORDER BY year DESC
      `);

      return NextResponse.json(years);
    }
  } catch (error) {
    console.error('연혁 조회 오류:', error);
    return NextResponse.json({ error: '연혁을 불러오는데 실패했습니다' }, { status: 500 });
  }
} 