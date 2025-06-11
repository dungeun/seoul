'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  views: number;
  createdAt: string;
}

interface ApiResponse {
  posts: Post[];
  totalPages: number;
  currentPage: number;
}

export default function InfographicPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', '온실가스', '정책', '재생에너지', '에너지', '교통', '환경'];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/boards/infographic/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data: ApiResponse = await response.json();
      
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('인포그래픽 데이터 로딩 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">인포그래픽을 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Sub Title Section */}
      <section className="relative h-[300px] bg-[#F5FDE7] flex items-center justify-center overflow-hidden">
        {/* Gradient Circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-70 top-[-50px] left-[10%] animate-float-1 bg-gradient-radial from-[#A8E6A3] via-[#7DD87A] to-[rgba(125,216,122,0.3)]"></div>
          <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] opacity-70 top-[50px] right-[15%] animate-float-2 bg-gradient-radial from-[#D4E157] via-[#C0CA33] to-[rgba(192,202,51,0.3)]"></div>
          <div className="absolute w-[180px] h-[180px] rounded-full blur-[80px] opacity-70 bottom-[-30px] left-1/2 transform -translate-x-1/2 animate-float-3 bg-gradient-radial from-[#B2DFDB] via-[#80CBC4] to-[rgba(128,203,196,0.3)]"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">인포그래픽</h1>
          <div className="flex justify-center items-center gap-2 text-gray-600 text-sm mt-4">
            <span>홈</span>
            <span>&gt;</span>
            <span className="text-[#6ECD8E] font-semibold">인포그래픽</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white py-12">
        <div className="max-w-[1920px] mx-auto px-12">
          
          {/* 검색 및 필터 */}
          <div className="flex justify-between items-center mb-12 gap-8 flex-wrap">
            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full border transition-all duration-300 text-sm ${
                    selectedCategory === category
                      ? 'bg-[#6ECD8E] text-white border-[#6ECD8E]'
                      : 'bg-transparent text-[#6ECD8E] border-[#6ECD8E] hover:bg-[#6ECD8E] hover:text-white'
                  }`}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="인포그래픽 검색..."
                className="px-4 py-2 border border-gray-300 rounded min-w-[200px] focus:outline-none focus:border-[#6ECD8E]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#6ECD8E] text-white rounded hover:bg-[#5eb87d] transition-colors"
              >
                검색
              </button>
            </form>
          </div>

          {/* 인포그래픽 그리드 */}
          {loading ? (
            <div className="text-center py-12">
              <div>로딩 중...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div>인포그래픽이 없습니다.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map(post => (
                <Link
                  key={post.id}
                  href={`/infographic/${post.id}`}
                  className="group block border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 bg-white hover:transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-[200px] relative bg-gray-100">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">이미지 없음</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="inline-block bg-[#6ECD8E] text-white text-xs px-2 py-1 rounded-full mb-3">
                      {post.category}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                      <span>조회 {post.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  이전
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded transition-colors ${
                    currentPage === page
                      ? 'bg-[#6ECD8E] text-white border-[#6ECD8E]'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 transition-colors"
                >
                  다음
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50% { transform: translateX(-50%) translateY(-25px) scale(1.05); }
        }
        
        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 10s ease-in-out infinite;
        }
        
        .animate-float-3 {
          animation: float-3 12s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }
      `}</style>
    </>
  );
}