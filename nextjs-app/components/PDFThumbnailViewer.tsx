'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PDFThumbnailViewerProps {
  url: string;
  title: string;
  thumbnailUrl?: string;
}

export default function PDFThumbnailViewer({ url, title, thumbnailUrl }: PDFThumbnailViewerProps) {
  const [showPDF, setShowPDF] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // PDF 썸네일 이미지 경로 생성
  const getThumbnailPath = () => {
    if (thumbnailUrl) return thumbnailUrl;
    
    // URL에서 파일명 추출
    const filename = url.split('/').pop()?.split('.')[0];
    
    // 각 PDF에 대한 썸네일 매핑
    const thumbnailMap: { [key: string]: string } = {
      'carbon_neutral_guide_2024': '/img/2024.jpg',
      'green_campus_plan_2024': '/img/2023.jpg',
      'renewable_energy_status_2024': '/img/2022.jpg',
      'carbon_reduction_research': '/img/2021.jpg',
      'green_building_guidelines': '/img/2020.jpg',
      'waste_recycling_report_2023': '/img/2019.jpg',
      'energy_saving_campaign_2024': '/img/2018.jpg',
      'carbon_neutral_education_manual': '/img/2017.jpg'
    };
    
    return thumbnailMap[filename || ''] || '/img/pdf-placeholder.png';
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
        {/* PDF 썸네일 */}
        <div className="relative h-96 bg-gray-100 cursor-pointer group" onClick={() => setShowPDF(true)}>
          <Image
            src={getThumbnailPath()}
            alt={`${title} 썸네일`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              PDF 보기
            </button>
          </div>
        </div>

        {/* 하단 정보 및 버튼 */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">PDF 문서</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPDF(true)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                title="미리보기"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <a
                href={url}
                download
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                title="다운로드"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* PDF 뷰어 모달 */}
      {showPDF && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center bg-gray-800 text-white p-3">
              <h3 className="text-lg font-medium">{title}</h3>
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
                <button
                  onClick={() => setShowPDF(false)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-100 overflow-auto" style={{ height: 'calc(90vh - 60px)' }}>
              <iframe
                src={url}
                className="w-full h-full min-h-[600px]"
                title={title}
              />
            </div>
          </div>
        </div>
      )}

      {/* 전체화면 모달 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-black">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => {
                setIsFullscreen(false);
                setShowPDF(false);
              }}
              className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src={url}
            className="w-full h-full"
            title={title}
          />
        </div>
      )}
    </>
  );
}