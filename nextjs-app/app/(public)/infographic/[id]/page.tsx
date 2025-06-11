'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, CalendarIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  content: string;
  imageUrl: string;
  pdfUrl: string;
  views: number;
  createdAt: string;
}

export default function InfographicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/boards/infographic/posts/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('인포그래픽을 찾을 수 없습니다.');
        } else {
          setError('데이터를 불러오는데 실패했습니다.');
        }
        return;
      }

      const data: Post = await response.json();
      setPost(data);
      setLoading(false);
    } catch (error) {
      console.error('인포그래픽 상세 데이터 로딩 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  if (loading) {
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

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">인포그래픽을 찾을 수 없습니다.</div>
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
          <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">{post.title}</h1>
          <div className="flex justify-center items-center gap-2 text-gray-600 text-sm mt-4">
            <span>홈</span>
            <span>&gt;</span>
            <span>그린레포트</span>
            <span>&gt;</span>
            <span>인포그래픽</span>
            <span>&gt;</span>
            <span className="text-[#6ECD8E] font-semibold">{post.title}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="bg-white py-12">
        <div className="max-w-[1200px] mx-auto px-12">
          
          {/* 뒤로가기 버튼 */}
          <div className="mb-8">
            <Link 
              href="/infographic" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              목록으로 돌아가기
            </Link>
          </div>

          {/* 인포그래픽 정보 */}
          <div className="bg-gray-50 p-8 rounded-xl mb-12">
            <div className="flex justify-between items-start gap-8 mb-4">
              <div className="flex-1">
                <div className="inline-block bg-[#6ECD8E] text-white text-sm px-3 py-1 rounded-full mb-4">
                  {post.category}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {post.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {post.description}
                </p>
              </div>
              
              <div className="flex flex-col gap-4 min-w-[200px]">
                <button
                  onClick={() => handleDownload(post.pdfUrl, `${post.title}.pdf`)}
                  className="px-6 py-3 bg-[#6ECD8E] text-white rounded-lg hover:bg-[#5eb87d] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  📄 PDF 다운로드
                </button>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>조회 {post.views}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 인포그래픽 이미지 */}
          <div className="text-center mb-12">
            {!imageLoaded && !imageError && (
              <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-xl text-lg text-gray-500">
                이미지를 불러오는 중...
              </div>
            )}
            
            {imageError && (
              <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-xl text-lg text-gray-400 border-2 border-dashed border-gray-300">
                이미지를 불러올 수 없습니다
              </div>
            )}
            
            {post.imageUrl && (
              <div className={`relative ${imageLoaded ? 'block' : 'hidden'}`}>
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={1200}
                  height={800}
                  className="rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  onClick={() => {
                    window.open(post.imageUrl, '_blank');
                  }}
                />
                {imageLoaded && (
                  <div className="mt-4 text-sm text-gray-500">
                    클릭하면 크게 볼 수 있습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 상세 내용 */}
          <div className="bg-white p-12 rounded-xl border border-gray-200 mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 pb-2 border-b-2 border-[#6ECD8E]">
              상세 정보
            </h3>
            <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
              {post.content}
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div className="flex justify-center">
            <Link
              href="/infographic"
              className="px-8 py-4 bg-[#6ECD8E] text-white rounded-lg hover:bg-[#5eb87d] transition-colors font-medium"
            >
              목록으로 돌아가기
            </Link>
          </div>
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