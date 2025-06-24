'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ChevronLeftIcon, ChevronRightIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface Board {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type?: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  board_id: number;
  category_id?: number;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

interface GroupedPosts {
  [year: string]: Post[];
}

export default function GreenReportPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groupedPosts, setGroupedPosts] = useState<GroupedPosts>({});
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoardData();
  }, []);

  useEffect(() => {
    // Group posts by year
    const grouped: GroupedPosts = {};
    posts.forEach(post => {
      const year = post.title.match(/\d{4}/)?.[0] || new Date(post.created_at).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(post);
    });
    
    // Sort years in descending order
    const sortedGrouped: GroupedPosts = {};
    Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a)).forEach(year => {
      sortedGrouped[year] = grouped[year];
    });
    
    setGroupedPosts(sortedGrouped);
    
    // Select the most recent year by default
    if (Object.keys(sortedGrouped).length > 0 && !selectedYear) {
      setSelectedYear(Object.keys(sortedGrouped)[0]);
    }
  }, [posts]);

  useEffect(() => {
    // Reset current index when year changes
    setCurrentIndex(0);
  }, [selectedYear]);

  const fetchBoardData = async () => {
    try {
      // Fetch board info
      const boardRes = await fetch('/api/boards/green-report');
      if (!boardRes.ok) throw new Error('Board not found');
      const boardData = await boardRes.json();
      setBoard(boardData);

      // Fetch posts
      const postsRes = await fetch('/api/boards/green-report/posts?limit=100');
      if (!postsRes.ok) throw new Error('Failed to fetch posts');
      const postsData = await postsRes.json();
      setPosts(postsData.posts || []);
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    const yearPosts = groupedPosts[selectedYear] || [];
    if (currentIndex < yearPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const yearPosts = groupedPosts[selectedYear] || [];
  const currentPost = yearPosts[currentIndex];

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
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">그린캠퍼스 보고서</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              <span className="text-[#333]">홈</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#333]">그린캠퍼스</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#6ECD8E] font-semibold">그린캠퍼스 보고서</span>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <main className="bg-white pt-[50px] pb-16">
          <div className="max-w-[1200px] mx-auto px-8">
            {Object.keys(groupedPosts).length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl text-gray-300 mb-4">📋</div>
                <p className="text-xl text-gray-500">등록된 보고서가 없습니다.</p>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* 왼쪽 연도 리스트 */}
                <div className="flex-shrink-0">
                  <div className="text-right pr-6">
                    <div className="space-y-2">
                      {Object.keys(groupedPosts).map((year) => (
                        <div
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setCurrentIndex(0);
                          }}
                          className={`cursor-pointer transition-all duration-200`}
                        >
                          <h4 className={`text-3xl font-bold text-[#6ECD8E] hover:text-[#5BB97B] ${
                            selectedYear === year ? 'text-[#5BB97B]' : ''
                          }`}>
                            {year}년
                          </h4>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 구분선 */}
                <div className="w-0.5 bg-[#6ECD8E] flex-shrink-0"></div>
                
                {/* 오른쪽 선택된 연도의 보고서 */}
                <div className="flex-1 pl-6">
                  {currentPost ? (
                    <div className="bg-white w-full">
                      {/* Navigation and Download Controls */}
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className={`p-2 rounded-lg transition-colors ${
                              currentIndex === 0
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#6ECD8E] text-white hover:bg-[#5BB97B]'
                            }`}
                          >
                            <ChevronLeftIcon className="h-5 w-5" />
                          </button>
                          <span className="text-lg font-medium">
                            {currentIndex + 1} / {yearPosts.length}
                          </span>
                          <button
                            onClick={handleNext}
                            disabled={currentIndex === yearPosts.length - 1}
                            className={`p-2 rounded-lg transition-colors ${
                              currentIndex === yearPosts.length - 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#6ECD8E] text-white hover:bg-[#5BB97B]'
                            }`}
                          >
                            <ChevronRightIcon className="h-5 w-5" />
                          </button>
                        </div>
                        
                        {/* Download button for attached file */}
                        {currentPost.attachment_filepath && currentPost.attachment_filename && (
                          <button
                            onClick={() => handleDownload(currentPost.attachment_filepath!, currentPost.attachment_filename!)}
                            className="inline-flex items-center px-4 py-2 bg-[#6ECD8E] text-white rounded-lg hover:bg-[#5BB97B] transition-colors"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            {currentPost.attachment_filename.endsWith('.pdf') ? 'PDF 다운로드' : '파일 다운로드'}
                          </button>
                        )}
                      </div>

                      {/* Post Title */}
                      <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentPost.title}</h2>
                      
                      {/* 이미지 영역 */}
                      {currentPost.featured_image && (
                        <div className="mb-8 w-full">
                          <img
                            src={currentPost.featured_image}
                            alt={currentPost.title}
                            className="w-full h-auto max-w-full rounded-lg shadow-lg"
                            style={{ display: 'block', width: '100%', height: 'auto' }}
                          />
                        </div>
                      )}
                      
                      {/* 내용 영역 */}
                      <div 
                        className="prose prose-lg max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: currentPost.content }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="text-center">
                        <div className="text-6xl text-gray-300 mb-4">📄</div>
                        <p className="text-gray-500">연도를 선택해주세요</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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