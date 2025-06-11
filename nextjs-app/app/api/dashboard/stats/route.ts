import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET() {
  try {
    // 각 테이블의 총 개수를 가져옵니다
    const stats = {
      posts: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM posts')?.count || 0,
      boards: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM boards')?.count || 0,
      categories: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM categories')?.count || 0,
      menus: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM menus')?.count || 0,
      files: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM files')?.count || 0,
      hero_slides: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM hero_slides WHERE active = 1')?.count || 0,
      energy_data: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM energy_data')?.count || 0,
      solar_data: dbQuery.get<{ count: number }>('SELECT COUNT(*) as count FROM solar_data')?.count || 0,
    };

    // 최근 활동 정보
    const recentPosts = dbQuery.all(`
      SELECT id, title, created_at FROM posts 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    const recentFiles = dbQuery.all(`
      SELECT id, title, created_at FROM files 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return NextResponse.json({
      stats,
      recent: {
        posts: recentPosts,
        files: recentFiles
      }
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json({ error: '통계를 불러오는데 실패했습니다' }, { status: 500 });
  }
}