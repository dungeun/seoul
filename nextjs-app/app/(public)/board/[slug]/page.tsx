'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';

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
}

export default function BoardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    fetchBoardData();
  }, [slug, page]);

  useEffect(() => {
    // gallery-01 타입일 때 첫 번째 게시물 자동 선택
    if (board?.type === 'gallery-01' && posts.length > 0 && !selectedPost) {
      setSelectedPost(posts[0]);
    }
  }, [board, posts]);

  const fetchBoardData = async () => {
    try {
      // Fetch board info
      const boardRes = await fetch(`/api/boards/${slug}`);
      if (!boardRes.ok) throw new Error('Board not found');
      const boardData = await boardRes.json();
      setBoard(boardData);

      // Fetch posts
      const postsRes = await fetch(`/api/boards/${slug}/posts?page=${page}&limit=9`);
      if (!postsRes.ok) throw new Error('Failed to fetch posts');
      const postsData = await postsRes.json();
      setPosts(postsData.posts || []);
      setTotalPages(Math.ceil((postsData.total || 0) / 9));
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">게시판을 찾을 수 없습니다</h2>
          <Link href="/" className="text-green-600 hover:text-green-800">
            홈으로 돌아가기
          </Link>
        </div>
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
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">{board.name}</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              <span className="text-[#333]">홈</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#333]">그린캠퍼스</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#6ECD8E] font-semibold">{board.name}</span>
            </div>
            {board.description && (
              <p className="text-lg text-gray-600 mt-2 opacity-90">{board.description}</p>
            )}
          </div>
        </section>

        {/* Content Area */}
        <main className="bg-white pt-[50px] pb-16">
          <div className="max-w-[1200px] mx-auto px-8">
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl text-gray-300 mb-4">📋</div>
                <p className="text-xl text-gray-500">등록된 게시물이 없습니다.</p>
              </div>
            ) : (
              <>
                {/* Gallery Layout */}
                {board.type === 'gallery' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/board/${slug}/${post.id}`}
                        className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative overflow-hidden">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image.startsWith('http') ? post.featured_image : `http://localhost:10000${post.featured_image}`}
                              alt={post.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-[#F5FDE7] to-[#E8F5E8] flex items-center justify-center">
                              <svg className="w-16 h-16 text-[#6ECD8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-[#6ECD8E] transition-colors text-center">
                            {post.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : board.type === 'archive' ? (
                  /* Archive Layout */
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#F5FDE7]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            번호
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            제목
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            첨부파일
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            작성일
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            다운로드
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posts && posts.map((post, index) => (
                          <tr key={post.id} className="hover:bg-[#F5FDE7]">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(posts?.length || 0) - index}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/board/${slug}/${post.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-[#6ECD8E]"
                              >
                                {post.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              {post.featured_image && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  PDF
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {post.featured_image && (
                                <a
                                  href={post.featured_image.startsWith('http') ? post.featured_image : `http://localhost:10000${post.featured_image}`}
                                  download
                                  className="inline-flex items-center text-[#6ECD8E] hover:text-[#5BB97B]"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                  </svg>
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : board.type === 'gallery-01' ? (
                  /* Gallery-01 Layout (Left Title List, Right Selected Content/Image) */
                  <div className="flex gap-8">
                    {/* 왼쪽 게시물 제목 리스트 */}
                    <div className="w-[350px] flex-shrink-0">
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-[#F5FDE7] px-6 py-4 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-[#6ECD8E]">게시물 목록</h3>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                          {posts.map((post) => (
                            <div
                              key={post.id}
                              onClick={() => setSelectedPost(post)}
                              className={`px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-[#F5FDE7] ${
                                selectedPost?.id === post.id ? 'bg-[#F5FDE7] border-l-4 border-[#6ECD8E]' : ''
                              }`}
                            >
                              <h4 className={`text-sm font-medium ${
                                selectedPost?.id === post.id ? 'text-[#6ECD8E]' : 'text-gray-900'
                              }`}>
                                {post.title}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* 오른쪽 선택된 게시물 내용 */}
                    <div className="flex-1">
                      {selectedPost ? (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {/* 이미지 영역 */}
                          {selectedPost.featured_image && (
                            <div className="relative h-[400px] bg-gray-100">
                              <img
                                src={selectedPost.featured_image.startsWith('http') 
                                  ? selectedPost.featured_image 
                                  : `http://localhost:10000${selectedPost.featured_image}`}
                                alt={selectedPost.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* 내용 영역 */}
                          <div className="p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                              <span>{new Date(selectedPost.created_at).toLocaleDateString()}</span>
                              <span>·</span>
                              <span>조회수 {selectedPost.view_count}</span>
                            </div>
                            <div 
                              className="prose prose-lg max-w-none text-gray-700"
                              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                            />
                            
                            {/* 상세보기 버튼 */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                              <Link
                                href={`/board/${slug}/${selectedPost.id}`}
                                className="inline-flex items-center text-[#6ECD8E] hover:text-[#5BB97B] font-medium"
                              >
                                자세히 보기
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                          <div className="text-6xl text-gray-300 mb-4">📄</div>
                          <p className="text-gray-500">게시물을 선택해주세요</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* List Layout */
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#F5FDE7]">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            번호
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            제목
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            작성일
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#6ECD8E] uppercase tracking-wider">
                            조회수
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posts && posts.map((post, index) => (
                          <tr key={post.id} className="hover:bg-[#F5FDE7]">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(posts?.length || 0) - index}
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                href={`/board/${slug}/${post.id}`}
                                className="text-sm font-medium text-gray-900 hover:text-[#6ECD8E]"
                              >
                                {post.title}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(post.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {post.view_count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-[#F5FDE7] hover:border-[#6ECD8E] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            page === i + 1
                              ? 'bg-[#6ECD8E] text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-[#F5FDE7] hover:border-[#6ECD8E]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-[#F5FDE7] hover:border-[#6ECD8E] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}

            {/* Write Button */}
            <div className="mt-8 text-center">
              <Link
                href={`/admin/posts?board=${slug}`}
                className="inline-flex items-center px-6 py-3 bg-[#6ECD8E] text-white font-medium rounded-lg hover:bg-[#5BB97B] transition-colors shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                글쓰기
              </Link>
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