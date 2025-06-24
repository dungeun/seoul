import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `banner-${uniqueSuffix}.webp`;
    
    // Convert to WebP and resize if needed
    const processedImage = await sharp(buffer)
      .resize(200, 200, { 
        fit: 'cover',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'banners');
    const filePath = join(uploadDir, filename);
    
    // Create directory if it doesn't exist
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });
    
    await writeFile(filePath, processedImage);

    return NextResponse.json({ 
      url: `/uploads/banners/${filename}`,
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}