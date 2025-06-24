'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

interface CarbonTechPost {
  id: number;
  name: string;
  department: string;
  url: string;
  screenshot_url?: string;
  main_category: string;
  sub_category: string;
  order_index: number;
  status: string;
}

const CarbonTech: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('탄소중립 기술개발');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('수소 분야 (생산, 운반, 저장 등)');
  const [posts, setPosts] = useState<CarbonTechPost[]>([]);
  const [loading, setLoading] = useState(true);

  // 모든 대분류 목록
  const allMainCategories = [
    '탄소중립 기술개발',
    '탄소중립 정책연구',
    '기후과학 연구',
    '기타대분류'
  ];

  // 대분류별 중분류 목록 (실제 데이터베이스 기준)
  const subCategoriesByMain: {[key: string]: string[]} = {
    '탄소중립 기술개발': [
      '수소 분야 (생산, 운반, 저장 등)',
      '탄소 포집, 전환 활용 및 저장 분야 (CCUS 및 DAC 등)',
      '친환경 자동차 및 배터리 분야',
      '무탄소 전력 공급 분야 (태양, 풍력, 수소 암모니아 발전, 연료전지 등)',
      '저탄소 공정기술 개발 (석유화학, 철강 공정 등)',
      '전력시스템 (전략망, 전력 저장 등)',
      '원자력에너지 기술 분야',
      '기타'
    ],
    '탄소중립 정책연구': [
      '에너지 전환 부문',
      '수송 부문',
      '건물 부문',
      '농업 부문',
      '도시 관리 및 계획 (탄소중립 도시 등)',
      '기타'
    ],
    '기후과학 연구': [
      '탄소순환',
      '온실가스 감시 기술',
      '기후모델',
      '기타'
    ],
    '기타대분류': [
      '기타'
    ]
  };

  // 데이터 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/carbon-tech');
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // 선택된 대분류에 따른 중분류 가져오기
  const getCurrentSubCategories = () => {
    return subCategoriesByMain[selectedCategory] || [];
  };
  
  // 선택된 중분류에 따른 연구자 가져오기
  const getCurrentResearchers = () => {
    return posts.filter(post => 
      post.main_category === selectedCategory && 
      post.sub_category === selectedSubCategory &&
      post.status === 'published'
    ).sort((a, b) => a.order_index - b.order_index || a.name.localeCompare(b.name));
  };
  
  // 중분류별 연구자 수 가져오기
  const getResearcherCount = (subCategory: string) => {
    return posts.filter(post => 
      post.main_category === selectedCategory && 
      post.sub_category === subCategory &&
      post.status === 'published'
    ).length;
  };

  return (
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* CSS 스타일 추가 */}
      <style>{`
        @font-face {
          font-family: 'SUIT';
          font-weight: 400;
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2') format('woff2');
        }

        @font-face {
          font-family: 'SUIT';
          font-weight: 700;
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Bold.woff2') format('woff2');
        }

        @font-face {
          font-family: 'SUIT';
          font-weight: 800;
          src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-ExtraBold.woff2') format('woff2');
        }

        /* Main wrapper 설정 */
        .main-wrapper {
          max-width: 1920px !important;
          margin: 0 auto !important;
          width: 100% !important;
        }

        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background-color: #ffffff !important;
          color: #333333 !important;
        }

        /* 서브 타이틀 영역 */
        .sub-title-section {
          background-color: #F5FDE7;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* 그라디언트 구들 */
        .gradient-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .gradient-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.7;
        }

        .gradient-circle-1 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }

        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%);
          top: 50px;
          right: 15%;
          animation: float2 10s ease-in-out infinite;
        }

        .gradient-circle-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%);
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          animation: float3 12s ease-in-out infinite;
        }

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

        .sub-title-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .sub-title-content h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }

        .sub-title-content p {
          font-size: 1.2rem;
          color: #666;
          margin: 0 0 2rem 0;
        }

        .breadcrumb {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .breadcrumb span {
          color: #6ECD8E;
        }
      `}</style>

      <Header currentPage="carbon-tech" />

      {/* Sub Title Section */}
      <section className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="sub-title-content">
          <h1 style={{ color: '#6ECD8E' }}>
            탄소중립 기술개발
          </h1>
          <p>서울대학교 탄소중립 연구자 네트워크</p>
          <div className="breadcrumb">
            <span>홈</span>
            <span>&gt;</span>
            <span>그린캠퍼스</span>
            <span>&gt;</span>
            <span style={{ color: '#6ECD8E', fontWeight: '600' }}>탄소중립 기술개발</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 대분류 버튼들 */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto 4rem auto'
          }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '4rem',
              justifyContent: 'center'
            }}>
              {allMainCategories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    const subCategories = subCategoriesByMain[category];
                    if (subCategories && subCategories.length > 0) {
                      setSelectedSubCategory(subCategories[0]);
                    }
                  }}
                  style={{
                    padding: '0.5rem 2rem',
                    borderRadius: '25px',
                    border: 'none',
                    backgroundColor: selectedCategory === category ? '#6ECD8E' : '#F5FDE7',
                    color: selectedCategory === category ? 'white' : '#6ECD8E',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '1.43rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 2단 레이아웃: 왼쪽 중분류, 오른쪽 연구자 */}
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '450px 1px 1fr',
            gap: '4rem',
            alignItems: 'start'
          }}>
            
            {/* 왼쪽: 중분류 메뉴 */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {getCurrentSubCategories().map((subCategory, index) => {
                  const isSelected = selectedSubCategory === subCategory;
                  // 괄호 앞뒤로 텍스트 분리
                  const parts = subCategory.match(/^([^(]+)(\(.+\))?$/);
                  const mainText = parts ? parts[1].trim() : subCategory;
                  const subText = parts && parts[2] ? parts[2] : '';
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedSubCategory(subCategory)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'right',
                        lineHeight: '1.6'
                      }}
                    >
                      <div style={{
                        fontSize: '1.5rem',
                        color: isSelected ? '#6ECD8E' : '#6ECD8E',
                        fontWeight: isSelected ? '800' : '700'
                      }}>
                        {mainText}
                      </div>
                      {subText && (
                        <div style={{
                          fontSize: '1.2rem',
                          color: isSelected ? '#6ECD8E' : '#6ECD8E',
                          fontWeight: '400',
                          opacity: isSelected ? 1 : 0.8,
                          marginTop: '0.2rem'
                        }}>
                          {subText}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 중간 구분선 */}
            <div style={{
              width: '1px',
              backgroundColor: '#6ECD8E',
              height: '100%',
              minHeight: '500px'
            }} />

            {/* 오른쪽: 연구자 카드들 */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  로딩 중...
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1.5rem',
                    rowGap: '2rem'
                  }}>
                    {getCurrentResearchers().map((researcher, index) => (
                      <div key={index} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease'
                      }}>
                        {/* 썸네일 영역 */}
                        <div style={{
                          width: '100%',
                          height: '180px',
                          position: 'relative',
                          overflow: 'hidden',
                          backgroundColor: '#f5f5f5'
                        }}>
                          <img 
                            src={researcher.screenshot_url || '/img/placeholder.png'}
                            alt={researcher.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        
                        {/* 연구자 정보 */}
                        <div style={{
                          padding: '1.5rem',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '0.5rem'
                          }}>
                            {researcher.name}
                          </div>
                          <div style={{
                            fontSize: '0.95rem',
                            color: '#666',
                            marginBottom: '1rem'
                          }}>
                            {researcher.department}
                          </div>
                          <a 
                            href={researcher.url || '#'} 
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              color: '#6ECD8E',
                              fontSize: '0.9rem',
                              textDecoration: 'none',
                              fontWeight: '500',
                              border: '1px solid #6ECD8E',
                              padding: '0.5rem 1rem',
                              borderRadius: '20px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#6ECD8E';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#6ECD8E';
                            }}
                          >
                            사이트 바로가기
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 하단 메시지 */}
                  {getCurrentResearchers().length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '1rem',
                      marginTop: '3rem',
                      padding: '2rem'
                    }}>
                      해당 분야의 게시물이 없습니다.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CarbonTech;