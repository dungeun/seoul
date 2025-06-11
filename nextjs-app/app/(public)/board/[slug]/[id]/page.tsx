'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  board_id: number;
  board_name?: string;
  board_slug?: string;
  category_id?: number;
  category_name?: string;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  attachment_filename?: string;
  attachment_filepath?: string;
  attachment_filesize?: number;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardSlug = params.slug as string;
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/post/${postId}`);
      if (!response.ok) throw new Error('Post not found');
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId, fetchPost]);

  const _handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('게시글이 삭제되었습니다.');
        router.push(`/board/${boardSlug}`);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleDownload = () => {
    if (post?.attachment_filepath) {
      window.location.href = `http://localhost:10000/api/posts/${post.id}/download`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">게시글을 찾을 수 없습니다</h2>
          <Link href={`/board/${boardSlug}`} className="text-green-600 hover:text-green-800">
            목록으로 돌아가기
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
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">{post.board_name || '게시판'}</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              <span className="text-[#333]">홈</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#333]">그린캠퍼스</span>
              <span className="text-[#333]">&gt;</span>
              <Link href={`/board/${boardSlug}`} className="text-[#333] hover:text-[#6ECD8E]">
                {post.board_name || '게시판'}
              </Link>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#6ECD8E] font-semibold">상세보기</span>
            </div>
          </div>
        </section>

        {/* Content Area */}
        <main className="bg-white pt-[50px] pb-16">
          <div className="max-w-[1200px] mx-auto px-8">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Post Header */}
              <div className="bg-[#F5FDE7] px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">{post.title}</h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>작성일: {new Date(post.created_at).toLocaleDateString()}</span>
                  <span>조회수: {post.view_count}</span>
                  {post.category_name && <span>카테고리: {post.category_name}</span>}
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <img
                    src={post.featured_image.startsWith('http') ? post.featured_image : `http://localhost:10000${post.featured_image}`}
                    alt={post.title}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}

              {/* Post Content */}
              <div className="px-6 py-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Attachment */}
              {post.attachment_filename && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">첨부파일: {post.attachment_filename}</span>
                      {post.attachment_filesize && (
                        <span className="text-sm text-gray-500">
                          ({(post.attachment_filesize / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-[#6ECD8E] text-white text-sm rounded hover:bg-[#5BB97B] transition-colors"
                    >
                      다운로드
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                이전으로
              </button>
              <Link
                href={`/board/${boardSlug}`}
                className="px-6 py-3 bg-[#6ECD8E] text-white font-medium rounded-lg hover:bg-[#5BB97B] transition-colors"
              >
                목록보기
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