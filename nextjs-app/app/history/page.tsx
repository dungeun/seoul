'use client';

import { useState, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';

interface HistoryItem {
  id: number;
  year: number;
  month?: number | null;
  day?: number | null;
  date_text: string;
  title: string;
  description?: string | null;
  sort_order: number;
  created_at: string;
}

interface YearData {
  year: number;
  count: number;
}

export default function HistoryPage() {
  const [years, setYears] = useState<YearData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(0);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 연도 목록 로드
  useEffect(() => {
    fetchYears();
  }, []);

  // 선택된 연도의 연혁 로드
  useEffect(() => {
    if (selectedYear) {
      fetchHistoryByYear(selectedYear);
    }
  }, [selectedYear]);

  // 마우스 휠 이벤트 처리
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        // 아래로 스크롤 - 다음 년도
        goToNextYear();
      } else {
        // 위로 스크롤 - 이전 년도
        goToPrevYear();
      }
    };

    const container = document.getElementById('history-container');
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentYearIndex, years]);

  const fetchYears = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        const sortedYears = data.sort((a: YearData, b: YearData) => b.year - a.year);
        setYears(sortedYears);
        if (sortedYears.length > 0) {
          setSelectedYear(sortedYears[0].year);
          setCurrentYearIndex(0);
        }
      }
    } catch (error) {
      console.error('연도 목록 로딩 실패:', error);
      setError('연도 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryByYear = async (year: number) => {
    try {
      const response = await fetch(`/api/history?year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setHistoryItems(data);
      }
    } catch (error) {
      console.error('연혁 로딩 실패:', error);
      setError('연혁을 불러오는데 실패했습니다.');
    }
  };

  const goToPrevYear = () => {
    if (currentYearIndex > 0) {
      const newIndex = currentYearIndex - 1;
      setCurrentYearIndex(newIndex);
      setSelectedYear(years[newIndex].year);
    }
  };

  const goToNextYear = () => {
    if (currentYearIndex < years.length - 1) {
      const newIndex = currentYearIndex + 1;
      setCurrentYearIndex(newIndex);
      setSelectedYear(years[newIndex].year);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

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

        {/* Sub Title Section */}
        <section className="bg-[#F5FDE7] h-[300px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-70 top-[-50px] left-[10%] animate-[float1_8s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%)' }}></div>
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] opacity-70 top-[50px] right-[15%] animate-[float2_10s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%)' }}></div>
            <div className="absolute w-[180px] h-[180px] rounded-full blur-[80px] opacity-70 bottom-[-30px] left-1/2 -translate-x-1/2 animate-[float3_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%)' }}></div>
          </div>
          <div className="text-center relative z-[2]">
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">친환경 활동 연혁</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              <span className="text-[#333]">홈</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#333]">그린캠퍼스</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#6ECD8E] font-semibold">친환경 활동 연혁</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="bg-white pb-16 pt-[50px]" id="history-container">
          <div className="max-w-[1200px] mx-auto flex">
            {/* 왼쪽 년도 표시 영역 - 고정 높이 */}
            <div className="w-[300px] h-[600px] flex flex-col items-center justify-center relative">
              {/* 위쪽 버튼 */}
              <button
                onClick={goToPrevYear}
                disabled={currentYearIndex === 0}
                className={`absolute top-12 p-3 rounded-full transition-all duration-200 ${
                  currentYearIndex === 0 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#6ECD8E] hover:bg-[#6ECD8E] hover:text-white shadow-md hover:shadow-lg'
                }`}
              >
                <ChevronUpIcon className="h-8 w-8" />
              </button>

              {/* 현재 년도 표시 */}
              <div className="text-center">
                <div className="text-[120px] font-bold text-[#6ECD8E] leading-none mb-4 select-none">
                  {selectedYear}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {historyItems.length}개의 친환경 활동
                </div>
              </div>

              {/* 아래쪽 버튼 */}
              <button
                onClick={goToNextYear}
                disabled={currentYearIndex === years.length - 1}
                className={`absolute bottom-12 p-3 rounded-full transition-all duration-200 ${
                  currentYearIndex === years.length - 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-[#6ECD8E] hover:bg-[#6ECD8E] hover:text-white shadow-md hover:shadow-lg'
                }`}
              >
                <ChevronDownIcon className="h-8 w-8" />
              </button>

              {/* 스크롤 안내 */}
              <div className="absolute bottom-4 text-xs text-gray-500 text-center">
                <div>마우스 휠로</div>
                <div>년도를 변경하세요</div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-0.5 bg-[#6ECD8E] mx-8 min-h-[600px]"></div>

            {/* 오른쪽 히스토리 내용 영역 - 가변 높이 */}
            <div className="flex-1 py-12 px-8 min-h-[600px]">
              {historyItems.length > 0 ? (
                <div className="space-y-8">
                  {historyItems.map((item, index) => (
                    <div key={item.id} className="group">
                      {/* 날짜 */}
                      <div className="text-2xl font-bold text-[#6ECD8E] mb-3">
                        {item.date_text}
                      </div>
                      
                      {/* 내용 */}
                      <div className="ml-4 border-l-4 border-[#6ECD8E] pl-6">
                        <h3 className="text-lg font-semibold text-gray-800 leading-relaxed mb-2">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-gray-600 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-4">📋</div>
                    <p className="text-xl text-gray-500">
                      {selectedYear}년도의 활동 기록이 없습니다.
                    </p>
                  </div>
                </div>
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