import { NextRequest, NextResponse } from 'next/server';

// POST /api/files - 파일 업로드 (이미지 전용)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 쿠키 디버깅
    const cookie = request.headers.get('cookie');
    console.log('Upload API - Cookie header:', cookie);
    
    // 백엔드 서버로 파일 전송
    const apiUrl = `${process.env.API_URL || 'http://localhost:10000'}/api/upload/image`;
    console.log('Upload API - URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Cookie': cookie || '',
      },
      body: formData,
    });

    console.log('Upload API - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload API - Error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `Failed to upload file: ${response.status}`);
    }

    const data = await response.json();
    
    // 백엔드 응답에서 URL을 filepath로 매핑
    return NextResponse.json({
      ...data,
      filepath: data.url || data.filepath,
      file_path: data.url || data.filepath
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: error.message || '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}