import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface Post {
  id: number;
  title: string;
  content: string;
  board_id?: number;
  category_id?: number;
  view_count: number;
  created_at: string;
  updated_at?: string;
  featured_image?: string;
  slug?: string;
  excerpt?: string;
  status?: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

// GET /api/posts - 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const board_id = searchParams.get('board_id');
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const board = searchParams.get('board');
    const page = searchParams.get('page') || '1';
    const limit = '10';
    const offset = String((parseInt(page) - 1) * parseInt(limit));

    let query = `
      SELECT p.*, b.name as board_name, c.name as category_name
      FROM posts p
      LEFT JOIN boards b ON p.board_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (board_id) {
      query += ` AND p.board_id = $${paramIndex++}`;
      params.push(parseInt(board_id));
    }

    if (board) {
      query += ` AND p.board_id = $${paramIndex++}`;
      params.push(parseInt(board));
    }

    if (category_id) {
      query += ` AND p.category_id = $${paramIndex++}`;
      params.push(parseInt(category_id));
    }

    if (search) {
      query += ` AND (p.title ILIKE $${paramIndex++} OR p.content ILIKE $${paramIndex++})`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(parseInt(limit), parseInt(offset));

    const posts = await dbQuery.all<Post>(query, params);
    
    // 전체 개수 조회
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM posts p
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (board_id) {
      countQuery += ` AND p.board_id = $${countParamIndex++}`;
      countParams.push(parseInt(board_id));
    }

    if (board) {
      countQuery += ` AND p.board_id = $${countParamIndex++}`;
      countParams.push(parseInt(board));
    }

    if (category_id) {
      countQuery += ` AND p.category_id = $${countParamIndex++}`;
      countParams.push(parseInt(category_id));
    }

    if (search) {
      countQuery += ` AND (p.title ILIKE $${countParamIndex++} OR p.content ILIKE $${countParamIndex++})`;
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await dbQuery.get<{ total: number }>(countQuery, countParams);

    return NextResponse.json({
      results: posts,
      count: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / parseInt(limit))
    });
  } catch (error) {
    console.error('Posts fetch error:', error);
    return NextResponse.json(
      { error: '게시글 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/posts - 게시글 생성
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let postData: any = {};
    let attachment: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      // FormData 처리
      const formData = await request.formData();
      
      // 텍스트 필드 추출
      postData.title = formData.get('title') as string;
      postData.slug = formData.get('slug') as string;
      postData.content = formData.get('content') as string;
      postData.excerpt = formData.get('excerpt') as string;
      postData.featured_image = formData.get('featured_image') as string;
      postData.thumbnail_url = formData.get('thumbnail_url') as string;
      postData.board_id = formData.get('board_id') ? parseInt(formData.get('board_id') as string) : null;
      postData.category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null;
      postData.status = formData.get('status') as string || 'published';
      
      // 디버깅 로그
      console.log('FormData received:', {
        title: postData.title,
        content: postData.content,
        board_id: postData.board_id,
        status: postData.status
      });
      
      // 첨부파일 확인
      attachment = formData.get('attachment') as File;
    } else {
      // JSON 처리
      postData = await request.json();
    }

    if (!postData.title?.trim() || !postData.content?.trim()) {
      console.error('Missing required fields:', {
        title: postData.title,
        content: postData.content,
        hasTitle: !!postData.title,
        hasContent: !!postData.content
      });
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 첨부파일 처리
    let attachment_filename = null;
    let attachment_filepath = null;
    let attachment_filesize = null;

    if (attachment) {
      // 파일 확장자 확인
      const allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.hwp'];
      const fileExt = attachment.name.toLowerCase().substring(attachment.name.lastIndexOf('.'));
      
      if (!allowedFileTypes.includes(fileExt)) {
        return NextResponse.json(
          { error: '지원되지 않는 파일 형식입니다.' },
          { status: 400 }
        );
      }

      // 파일 크기 확인 (50MB for PDFs, 10MB for others)
      const maxSize = fileExt === '.pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeMB = fileExt === '.pdf' ? 50 : 10;
      if (attachment.size > maxSize) {
        return NextResponse.json(
          { error: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.` },
          { status: 400 }
        );
      }

      // 파일명 생성 (timestamp + 랜덤 문자열)
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}_${randomString}${fileExt}`;

      // uploads 디렉토리 확인 및 생성
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Failed to create upload directory:', error);
      }

      // 파일 저장
      const bytes = await attachment.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, fileName);
      
      await writeFile(filePath, buffer);

      // 파일 정보 설정
      attachment_filename = attachment.name;
      attachment_filepath = `/uploads/${fileName}`;
      attachment_filesize = attachment.size;
    }

    // 게시글 생성
    const result = await dbQuery.run(
      `INSERT INTO posts (
        title, slug, content, excerpt, featured_image, thumbnail_url,
        board_id, category_id, status, 
        attachment_filename, attachment_filepath, attachment_filesize,
        view_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
      RETURNING id`,
      [
        postData.title, 
        postData.slug || null, 
        postData.content, 
        postData.excerpt || null, 
        postData.featured_image || null,
        postData.thumbnail_url || null,
        postData.board_id || null, 
        postData.category_id || null, 
        postData.status || 'published',
        attachment_filename,
        attachment_filepath,
        attachment_filesize,
        0, 
        new Date().toISOString()
      ]
    );

    const newPost = await dbQuery.get<Post>(
      'SELECT * FROM posts WHERE id = $1',
      [result.rows[0]?.id]
    );

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      { error: '게시글 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}