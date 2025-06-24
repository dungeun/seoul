import { NextRequest, NextResponse } from 'next/server';
import { dbQuery } from '@/lib/database';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

interface Post {
  id: number;
  title: string;
  content: string;
  board_id: number;
  category_id?: number;
  status: string;
  featured_image?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  excerpt?: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

// GET /api/posts/[id] - 게시글 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다' },
        { status: 400 }
      );
    }
    
    const post = await dbQuery.get<Post>(`
      SELECT p.*, b.name as board_name, c.name as category_name
      FROM posts p
      LEFT JOIN boards b ON p.board_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [postId]);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json(
      { error: '게시글을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[id] - 게시글 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다' },
        { status: 400 }
      );
    }

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
      postData.board_id = formData.get('board_id') ? parseInt(formData.get('board_id') as string) : null;
      postData.category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null;
      postData.status = formData.get('status') as string || 'published';
      
      // 첨부파일 확인
      attachment = formData.get('attachment') as File;
    } else {
      // JSON 처리
      postData = await request.json();
    }

    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 기존 게시글 확인
    const existingPost = await dbQuery.get<Post>(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );

    if (!existingPost) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 첨부파일 처리
    let attachment_filename = existingPost.attachment_filename;
    let attachment_filepath = existingPost.attachment_filepath;
    let attachment_filesize = existingPost.attachment_filesize;

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

    // 게시글 업데이트
    await dbQuery.run(
      `UPDATE posts 
       SET title = $1, slug = $2, content = $3, excerpt = $4, featured_image = $5,
           board_id = $6, category_id = $7, status = $8,
           attachment_filename = $9, attachment_filepath = $10, attachment_filesize = $11,
           updated_at = $12
       WHERE id = $13`,
      [
        postData.title,
        postData.slug || existingPost.slug,
        postData.content,
        postData.excerpt || existingPost.excerpt,
        postData.featured_image || existingPost.featured_image,
        postData.board_id || existingPost.board_id,
        postData.category_id || existingPost.category_id,
        postData.status || existingPost.status,
        attachment_filename,
        attachment_filepath,
        attachment_filesize,
        new Date().toISOString(),
        postId
      ]
    );

    const updatedPost = await dbQuery.get<Post>(
      'SELECT * FROM posts WHERE id = $1',
      [postId]
    );

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error('Post update error:', error);
    return NextResponse.json(
      { error: error.message || '게시글 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - 게시글 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { error: '유효하지 않은 게시글 ID입니다' },
        { status: 400 }
      );
    }
    
    // 게시글 존재 확인
    const post = await dbQuery.get<{ id: number }>(
      'SELECT id FROM posts WHERE id = $1',
      [postId]
    );

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 게시글 삭제
    await dbQuery.run('DELETE FROM posts WHERE id = $1', [postId]);

    return NextResponse.json({ 
      message: '게시글이 삭제되었습니다',
      id: postId 
    });
  } catch (error) {
    console.error('Post delete error:', error);
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}