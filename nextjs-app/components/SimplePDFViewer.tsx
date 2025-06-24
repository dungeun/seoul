'use client';

import { useState } from 'react';

interface SimplePDFViewerProps {
  url: string;
  title: string;
}

export default function SimplePDFViewer({ url, title }: SimplePDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        {/* 툴바 */}
        <div className="flex justify-between items-center bg-gray-800 text-white p-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{title}</span>
          </div>
          <div className="flex items-center gap-2">
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
            <a
              href={url}
              download
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="다운로드"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </a>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="bg-white p-4">
          <iframe
            src={`${url}#toolbar=1&navpanes=0`}
            className="w-full h-[600px] border border-gray-300 rounded"
            title={title}
          />
        </div>
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
          <iframe
            src={`${url}#toolbar=1&navpanes=1`}
            className="w-full h-full"
            title={title}
          />
        </div>
      )}
    </>
  );
}