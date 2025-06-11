import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), '..', 'database.db');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = new Database(dbPath, { readonly: true });
    
    const page = db.prepare(`
      SELECT id, title, slug, content, created_at, updated_at
      FROM pages
      WHERE slug = ?
    `).get(slug);
    
    db.close();
    
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