import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// POST /api/files - 파일 업로드 (이미지 전용)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '이미지가 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 확인
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. JPG, PNG, GIF, WebP만 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 확인 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 파일명 생성 (timestamp + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${ext}`;

    // uploads 디렉토리 확인 및 생성
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const thumbDir = path.join(uploadDir, 'thumbnails');
    try {
      await mkdir(uploadDir, { recursive: true });
      await mkdir(thumbDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }

    // 파일 저장
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    // 썸네일 생성 (300x300, 크롭)
    const thumbFileName = `thumb_${fileName}`;
    const thumbPath = path.join(thumbDir, thumbFileName);
    
    try {
      await sharp(buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(thumbPath);
      
      console.log(`Thumbnail created: ${thumbPath}`);
    } catch (thumbError) {
      console.error('Thumbnail creation failed:', thumbError);
      // 썸네일 생성 실패해도 원본 이미지는 업로드 성공으로 처리
    }

    // 응답
    const fileUrl = `/uploads/${fileName}`;
    const thumbUrl = `/uploads/thumbnails/thumb_${fileName}`;
    
    return NextResponse.json({
      success: true,
      filepath: fileUrl,
      file_path: fileUrl,
      url: fileUrl,
      thumbnail: thumbUrl,
      filename: fileName,
      originalName: file.name,
      size: file.size
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}