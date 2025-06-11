'use client';

import { useState, useEffect } from 'react';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';

interface BoardPost {
  id: number;
  title: string;
  content: string;
  link?: string;
  image?: string;
  category: string;
  created_at: string;
  main_category?: string;
  sub_category?: string;
}

const categories = [
  { id: 'link1', name: '링크게시판', active: true },
  { id: 'link2', name: '링크게시판', active: false },
  { id: 'link3', name: '링크게시판', active: false },
  { id: 'link4', name: '링크게시판', active: false }
];

const leftLinks = [
  { name: '기타, 환경, 과정 등', count: 5, postId: 1 },
  { name: '탄소 포집, 저장 활용 및 처리', count: 8, postId: 2 },
  { name: '무탄소 전력 공급', count: 12, postId: 3 },
  { name: '청정 열 및 전기화', count: 7, postId: 4 },
  { name: '바이오매스 모빌 건설시스템', count: 3, postId: 5 },
  { name: '화학적 에너지 기술 관리', count: 15, postId: 6 },
  { name: '전환 및 동력 시설', count: 6, postId: 1 },
  { name: '산업공정 및 제품', count: 9, postId: 2 },
  { name: '차세대 농업기술 개발', count: 4, postId: 3 },
  { name: '에너지 효율성 및 수요', count: 11, postId: 4 },
  { name: '탄소 흡수원', count: 2, postId: 5 }
];

const mockPosts: BoardPost[] = [
  {
    id: 1,
    title: '탄소포집 및 활용 기술 연구 동향',
    content: '최신 탄소포집 기술의 발전 현황과 활용 방안에 대한 연구 결과를 공유합니다.',
    link: 'https://example.com/carbon-capture',
    category: 'link1',
    created_at: '2024-06-10'
  },
  {
    id: 2,
    title: '친환경 건축 재료 개발 프로젝트',
    content: '지속가능한 건축을 위한 친환경 소재 개발에 대한 최신 연구 성과입니다.',
    link: 'https://example.com/green-materials',
    category: 'link1',
    created_at: '2024-06-09'
  },
  {
    id: 3,
    title: '바이오 연료 기술 백서 2024',
    content: '바이오 연료 기술의 현황과 미래 전망에 대한 종합 보고서입니다.',
    link: 'https://example.com/biofuel-report',
    category: 'link2',
    created_at: '2024-06-08'
  },
  {
    id: 4,
    title: '국제 탄소중립 연구 협력 네트워크',
    content: '글로벌 탄소중립 연구 기관들과의 협력 플랫폼입니다.',
    link: 'https://global-carbon-neutral.org',
    category: 'link2',
    created_at: '2024-06-07'
  },
  {
    id: 5,
    title: '에너지 효율성 향상 기술 세미나',
    content: '차세대 에너지 효율 기술에 대한 전문가 세미나 자료를 공유합니다.',
    link: 'https://example.com/energy-efficiency',
    category: 'link3',
    created_at: '2024-06-06'
  },
  {
    id: 6,
    title: '탄소 중립 촉매 기술 실험 결과',
    content: '혁신적인 촉매 기술을 통한 탄소 중립 달성 가능성을 보여주는 실험 결과입니다.',
    link: 'https://example.com/catalyst-tech',
    category: 'link4',
    created_at: '2024-06-05'
  }
];

export default function CarbonTechPage() {
  const [activeCategory, setActiveCategory] = useState('link1');
  const [selectedLink, setSelectedLink] = useState('기타, 환경, 과정 등');
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchLinkPosts();
  }, []);

  const fetchLinkPosts = async () => {
    try {
      const response = await fetch('http://localhost:10000/api/public/link-posts');
      if (response.ok) {
        const data = await response.json();
        // 링크 게시글을 BoardPost 형식으로 변환
        const convertedPosts = data.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          link: post.link_url,
          image: post.image_url,
          category: 'link1', // 모든 링크 게시글은 link1 카테고리로 설정
          created_at: post.created_at,
          main_category: post.main_category,
          sub_category: post.sub_category
        }));
        setPosts(convertedPosts);
      }
    } catch (error) {
      console.error('Error fetching link posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 선택된 링크에 따라 표시할 게시물 찾기
  const selectedPost = posts.find(post => post.main_category === selectedLink);

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

        {/* Hero Section */}
        <section className="bg-[#F5FDE7] h-[300px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-70 top-[-50px] left-[10%] animate-[float1_8s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%)' }}></div>
            <div className="absolute w-[150px] h-[150px] rounded-full blur-[80px] opacity-70 top-[50px] right-[15%] animate-[float2_10s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%)' }}></div>
            <div className="absolute w-[180px] h-[180px] rounded-full blur-[80px] opacity-70 bottom-[-30px] left-1/2 -translate-x-1/2 animate-[float3_12s_ease-in-out_infinite]" style={{ background: 'radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%)' }}></div>
          </div>
          <div className="text-center relative z-[2]">
            <h1 className="text-5xl font-bold text-[#6ECD8E] mb-4">탄소중립연구자 네트워크</h1>
            <div className="flex justify-center items-center gap-2 text-[#666] text-sm mt-4">
              <span className="text-[#333]">홈</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#333]">탄소중립연구자 네트워크</span>
              <span className="text-[#333]">&gt;</span>
              <span className="text-[#6ECD8E] font-semibold">게시판</span>
            </div>
          </div>
        </section>

        {/* Tab Menu */}
        <section className="bg-white border-b border-gray-200 mb-[50px] mt-[30px]">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex space-x-2 p-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-8 py-4 text-lg font-semibold transition-all duration-200 rounded-lg border-b-3 ${
                    activeCategory === category.id
                      ? 'text-[#6ECD8E] border-[#6ECD8E] bg-[#F5FDE7] shadow-sm'
                      : 'text-gray-600 border-transparent hover:text-[#6ECD8E] hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="bg-white pb-16">
          <div className="max-w-[1200px] mx-auto flex">
            {/* 왼쪽 카테고리 링크 */}
            <div className="w-[280px] pr-8">
              <h3 className="text-xl font-bold text-[#6ECD8E] mb-6">연구 분야</h3>
              <div className="space-y-2">
                {leftLinks.map((link, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedLink(link.name)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedLink === link.name
                        ? 'bg-[#6ECD8E] text-white border-[#6ECD8E]'
                        : 'bg-white text-gray-700 hover:bg-[#F5FDE7] border-gray-200 hover:border-[#6ECD8E]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium leading-tight">{link.name}</span>
                      <span className="text-xs opacity-75 ml-2">
                        {posts.filter(post => post.main_category === link.name).length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-0.5 bg-[#6ECD8E] mx-8"></div>

            {/* 오른쪽 게시물 카드 */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6ECD8E] mx-auto mb-4"></div>
                  <p className="text-gray-500 text-lg">로딩 중...</p>
                </div>
              ) : selectedPost ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  {/* 게시물 이미지 (있는 경우만) */}
                  {selectedPost.image && (
                    <div className="h-64 bg-gray-100 relative overflow-hidden">
                      <img
                        src={selectedPost.image}
                        alt={selectedPost.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                  )}
                  
                  {/* 게시물 정보 */}
                  <div className="p-8">
                    <h4 className="text-2xl font-bold text-[#6ECD8E] mb-3">
                      {selectedPost.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      {new Date(selectedPost.created_at).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                      {selectedPost.content}
                    </p>
                    
                    {/* 링크 */}
                    {selectedPost.link && (
                      <a
                        href={selectedPost.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[#6ECD8E] hover:text-[#5BB97B] font-medium transition-colors duration-200 text-lg"
                      >
                        <span className="mr-2">링크 바로가기</span>
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">해당 분야의 게시물이 없습니다.</p>
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