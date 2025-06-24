import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // Puppeteer 브라우저 실행
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 뷰포트 설정 (썸네일 크기)
    await page.setViewport({ width: 1280, height: 800 });
    
    try {
      // 웹사이트 접속 (타임아웃 30초)
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      // 스크린샷 캡처
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: false // 전체 페이지가 아닌 뷰포트만 캡처
      });
      
      // 파일명 생성
      const filename = `screenshot-${uuidv4()}.jpg`;
      const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'screenshots');
      const filePath = path.join(uploadPath, filename);
      
      // 디렉토리 생성
      await writeFile(filePath, screenshot).catch(async () => {
        // 디렉토리가 없으면 생성
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadPath, { recursive: true });
        await writeFile(filePath, screenshot);
      });
      
      await browser.close();
      
      // 웹 접근 가능한 경로 반환
      const webPath = `/uploads/screenshots/${filename}`;
      
      return NextResponse.json({
        success: true,
        screenshot_url: webPath,
        original_url: url
      });
      
    } catch (pageError) {
      await browser.close();
      console.error('Page load error:', pageError);
      
      return NextResponse.json(
        { error: '웹사이트 접속에 실패했습니다.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: '스크린샷 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}