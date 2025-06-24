'use client';

import { useState } from 'react';

interface PDFViewerProps {
  url: string;
  title: string;
}

export default function PDFViewer({ url, title }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'embed' | 'google' | 'download'>('embed');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // PDF 파일이 로컬인 경우 전체 URL 구성
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;

  return (
    <>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {/* 툴바 */}
        <div className="flex justify-between items-center bg-gray-800 text-white p-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 보기 모드 선택 */}
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-xs bg-gray-700 px-2 py-1 rounded"
            >
              <option value="embed">내장 뷰어</option>
              <option value="google">Google 뷰어</option>
              <option value="download">다운로드</option>
            </select>
            
            <button
              onClick={toggleFullscreen}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="전체화면"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="새 탭에서 열기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* PDF 뷰어 */}
        {viewMode === 'embed' && (
          <iframe
            src={`${url}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-[600px]"
            title={title}
          />
        )}
        
        {viewMode === 'google' && (
          <iframe
            src={googleViewerUrl}
            className="w-full h-[600px]"
            title={title}
            allow="autoplay"
          />
        )}
        
        {viewMode === 'download' && (
          <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50">
            <svg className="w-24 h-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-4">PDF 파일 미리보기가 불가능한 경우 다운로드하여 확인하세요.</p>
            <a
              href={url}
              download
              className="inline-flex items-center px-6 py-3 bg-[#6ECD8E] text-white font-medium rounded-lg hover:bg-[#5BB97B] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              PDF 다운로드
            </a>
          </div>
        )}
      </div>

      {/* 전체화면 모달 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {viewMode === 'embed' && (
            <iframe
              src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title={title}
            />
          )}
          {viewMode === 'google' && (
            <iframe
              src={googleViewerUrl}
              className="w-full h-full"
              title={title}
              allow="autoplay"
            />
          )}
        </div>
      )}
    </>
  );
}