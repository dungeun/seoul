'use client';

import { ReactNode } from 'react';
import Header from './Header';

interface BoardThemeItem {
  id?: number | string;
  title: string;
  content?: string;
  imageUrl?: string;
  date?: string;
  description?: string;
}

interface BoardThemeProps {
  pageTitle: string;
  breadcrumb?: string[];
  items: BoardThemeItem[];
  leftSideTitle?: string;
  showDates?: boolean;
  children?: ReactNode;
}

export default function BoardTheme({
  pageTitle,
  breadcrumb = ['홈', '그린캠퍼스'],
  items,
  leftSideTitle,
  showDates = false,
  children
}: BoardThemeProps) {
  return (
    <div className="w-full max-w-[1920px] mx-auto">
      <style jsx global>{`
        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-ExtraBold.woff2') format('woff2');
          font-weight: 800;
          font-style: normal;
        }
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
      `}</style>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header />

        {/* Sub Hero Section */}
        <section className="bg-[#F5FDE7] h-[300px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-70 top-[-50px] left-[10%] animate-[float1_8s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%)' }}></div>
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] opacity-70 top-[50px] right-[15%] animate-[float2_10s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%)' }}></div>
            <div className="absolute w-[180px] h-[180px] rounded-full blur-[80px] opacity-70 bottom-[-30px] left-1/2 -translate-x-1/2 animate-[float3_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%)' }}></div>
          </div>
          <div className="text-center relative z-[2]">
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">{pageTitle}</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              {breadcrumb.map((item, index) => (
                <span key={index}>
                  <span className={index === breadcrumb.length - 1 ? "text-[#6ECD8E] font-semibold" : "text-[#333]"}>
                    {item}
                  </span>
                  {index < breadcrumb.length - 1 && <span className="text-[#333] mx-2">&gt;</span>}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="bg-white pb-16 pt-[50px]">
          <div className="max-w-[1200px] mx-auto flex">
            {/* 왼쪽 제목 영역 */}
            <div className="w-[300px] flex flex-col items-center justify-start pt-12">
              {leftSideTitle && (
                <div className="text-center">
                  <div className="text-[48px] font-bold text-[#6ECD8E] leading-tight mb-4 select-none">
                    {leftSideTitle}
                  </div>
                  <div className="text-lg text-gray-600 font-medium">
                    {items.length}개의 내용
                  </div>
                </div>
              )}
            </div>

            {/* 구분선 */}
            <div className="w-0.5 bg-[#6ECD8E] mx-8 min-h-[600px]"></div>

            {/* 오른쪽 내용 영역 */}
            <div className="flex-1 py-12 px-8 min-h-[600px]">
              {children || (
                <>
                  {items.length > 0 ? (
                    <div className="space-y-12">
                      {items.map((item, index) => (
                        <div key={item.id || index} className="group">
                          {/* 날짜 (선택적) */}
                          {showDates && item.date && (
                            <div className="text-2xl font-bold text-[#6ECD8E] mb-3">
                              {item.date}
                            </div>
                          )}
                          
                          {/* 제목 */}
                          <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {item.title}
                          </h2>
                          
                          {/* 내용 영역 */}
                          <div className="flex flex-col lg:flex-row gap-8">
                            {/* 텍스트 내용 */}
                            <div className="flex-1">
                              {item.content && (
                                <div 
                                  className="text-gray-700 leading-relaxed text-lg"
                                  dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                              )}
                              {item.description && (
                                <p className="text-gray-700 leading-relaxed text-lg">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            
                            {/* 이미지 */}
                            {item.imageUrl && (
                              <div className="lg:w-[400px] lg:flex-shrink-0">
                                <img
                                  src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:10000${item.imageUrl}`}
                                  alt={item.title}
                                  className="w-full h-auto rounded-lg shadow-md"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* 구분선 (마지막 아이템 제외) */}
                          {index < items.length - 1 && (
                            <div className="mt-12 border-b border-gray-200"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-6xl text-gray-300 mb-4">📋</div>
                        <p className="text-xl text-gray-500">
                          등록된 내용이 없습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50% { transform: translateX(-50%) translateY(-25px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}