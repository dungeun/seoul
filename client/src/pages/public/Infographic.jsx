import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Infographic = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const response = await axios.get('/api/boards/infographic/posts', {
        params: {
          page: currentPage,
          limit: 9,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined
        }
      });
      
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('인포그래픽 데이터 로딩 오류:', error);
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (category) => {
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
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* CSS 스타일 */}
      <style>{`
        /* Force 1920px max-width for all elements */
        .main-wrapper {
          max-width: 1920px !important;
          margin: 0 auto !important;
          width: 100% !important;
        }
        
        .main-wrapper * {
          max-width: 1920px !important;
        }
        
        .header-container,
        .sub-title-section,
        main > div {
          max-width: 1920px !important;
          margin: 0 auto !important;
        }
        
        /* Font Face */
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
        
        .header {
          height: 200px;
          background: white;
          position: relative;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        
        .header-container {
          max-width: 1920px;
          margin: 0 auto;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: relative;
        }
        
        .logo img {
          height: 60px;
          width: auto;
          max-width: 400px;
        }
        
        .navigation {
          position: relative;
        }
        
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0;
          height: 200px;
          align-items: center;
        }
        
        .nav-item {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .nav-link {
          display: block;
          padding: 0 30px;
          color: #424443;
          text-decoration: none;
          font-family: 'SUIT', sans-serif;
          font-weight: 500;
          font-size: 1.3rem;
          border-bottom: none;
          transition: all 0.3s ease;
          position: relative;
          height: 200px;
          display: flex;
          align-items: center;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background-color: #53BD6A;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          width: calc(100% - 60px);
        }
        
        .nav-link:hover,
        .nav-link.active {
          color: #6ECD8E;
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
        
        .breadcrumb {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <a href="/">
              <img src="/img/main_logo.png" alt="서울대학교 탄소중립 캠퍼스" />
            </a>
          </div>
          <nav className="navigation">
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="/greenhouse-gas" className="nav-link">온실가스</a>
              </li>
              <li className="nav-item">
                <a href="/energy" className="nav-link">에너지</a>
              </li>
              <li className="nav-item">
                <a href="/solar-power" className="nav-link">태양광 발전</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">그린캠퍼스</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">그린레포트</a>
              </li>
              <li className="nav-item">
                <a href="/infographic" className="nav-link active">인포그래픽</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">탄소중립연구자 네트워크</a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">에너지 데이터 플랫폼</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Sub Title Section */}
      <section className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="sub-title-content">
          <h1>인포그래픽</h1>
          <div className="breadcrumb">
            <span>홈</span>
            <span>&gt;</span>
            <span style={{ color: '#6ECD8E', fontWeight: '600' }}>인포그래픽</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 검색 및 필터 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
            gap: '2rem'
          }}>
            {/* 카테고리 필터 */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: '1px solid #6ECD8E',
                    backgroundColor: selectedCategory === category ? '#6ECD8E' : 'transparent',
                    color: selectedCategory === category ? 'white' : '#6ECD8E',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {category === 'all' ? '전체' : category}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="인포그래픽 검색..."
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minWidth: '200px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6ECD8E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                검색
              </button>
            </form>
          </div>

          {/* 인포그래픽 그리드 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div>로딩 중...</div>
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div>인포그래픽이 없습니다.</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/infographic/${post.id}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    height: '200px', 
                    background: `url(${post.imageUrl}) center/cover no-repeat`,
                    backgroundColor: '#f8f9fa'
                  }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: '#6ECD8E',
                      color: 'white',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      marginBottom: '0.75rem'
                    }}>
                      {post.category}
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#333'
                    }}>
                      {post.title}
                    </h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      lineHeight: '1.4',
                      marginBottom: '1rem'
                    }}>
                      {post.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                      color: '#888'
                    }}>
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
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '3rem'
            }}>
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  이전
                </button>
              )}
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    backgroundColor: currentPage === page ? '#6ECD8E' : 'white',
                    color: currentPage === page ? 'white' : '#333',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  {page}
                </button>
              ))}
              
              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  다음
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Infographic; 