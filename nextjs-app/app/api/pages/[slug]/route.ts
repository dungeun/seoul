import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const page = await dbQuery.get<{
      id: number;
      title: string;
      slug: string;
      content: string;
      created_at: string;
      updated_at: string;
    }>(`
      SELECT id, title, slug, content, created_at, updated_at
      FROM pages
      WHERE slug = $1
    `, [slug]);
    
    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(page);
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}