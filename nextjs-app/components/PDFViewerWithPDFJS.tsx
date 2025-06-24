'use client';

import { useState, useEffect } from 'react';

interface PDFViewerWithPDFJSProps {
  url: string;
  title: string;
}

export default function PDFViewerWithPDFJS({ url, title }: PDFViewerWithPDFJSProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // PDF.js CDN 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        loadPDF();
      } else {
        setError('PDF.js 라이브러리 로드 실패');
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError('PDF.js 스크립트 로드 실패');
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, [url]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('PDF 로드 시작:', url);
      
      if (!window.pdfjsLib) {
        throw new Error('PDF.js가 로드되지 않았습니다');
      }
      
      // CORS 문제 해결을 위한 프록시 URL 사용
      const pdfUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
      
      const loadingTask = window.pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false
      });
      
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);
      
      // 첫 페이지 렌더링
      await renderPage(pdf, 1);
    } catch (err: any) {
      console.error('PDF 로드 오류:', err);
      setError(`PDF 로드 실패: ${err.message || '알 수 없는 오류'}`);
      setLoading(false);
    }
  };

  const renderPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }
      
      const context = canvas.getContext('2d');
      if (!context) {
        console.error('Canvas context not available');
        return;
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      setLoading(false);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Page render error:', err);
      setError('페이지 렌더링 실패');
      setLoading(false);
    }
  };

  const changePage = (delta: number) => {
    const newPage = currentPage + delta;
    if (newPage >= 1 && newPage <= pageCount) {
      window.pdfjsLib.getDocument(url).promise.then((pdf: any) => {
        renderPage(pdf, newPage);
      });
    }
  };

  return (
    <div className="pdf-viewer-container bg-gray-100 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{title}</span>
          {pageCount > 0 && (
            <span className="text-xs text-gray-300">
              페이지 {currentPage} / {pageCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(-1)}
            disabled={currentPage <= 1}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => changePage(1)}
            disabled={currentPage >= pageCount}
            className="p-1 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <a
            href={url}
            download
            className="p-1 hover:bg-gray-700 rounded"
            title="다운로드"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          </a>
        </div>
      </div>

      {/* PDF 캔버스 */}
      <div className="pdf-canvas-container overflow-auto bg-gray-50 p-4" style={{ maxHeight: '600px' }}>
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-red-600 mb-4">{error}</p>
            <a
              href={url}
              download
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              PDF 다운로드
            </a>
          </div>
        )}
        <canvas id="pdf-canvas" className="mx-auto shadow-lg" style={{ display: loading ? 'none' : 'block' }}></canvas>
      </div>
    </div>
  );
}

// TypeScript 전역 타입 선언
declare global {
  interface Window {
    pdfjsLib: any;
  }
}