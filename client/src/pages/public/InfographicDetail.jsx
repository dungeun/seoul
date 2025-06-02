import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const InfographicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/boards/infographic/posts/${id}`);
      setPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error('인포그래픽 상세 데이터 로딩 오류:', error);
      if (error.response?.status === 404) {
        setError('인포그래픽을 찾을 수 없습니다.');
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleDownload = (url, filename) => {
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
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* CSS 스타일 추가 */}
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
        
        /* 이미지 스타일 */
        .infographic-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .infographic-image:hover {
          transform: scale(1.02);
        }
        
        /* 버튼 스타일 */
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        
        .primary-btn {
          background-color: #6ECD8E;
          color: white;
        }
        
        .primary-btn:hover {
          background-color: #5BB377;
          transform: translateY(-1px);
        }
        
        .secondary-btn {
          background-color: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        
        .secondary-btn:hover {
          background-color: #e2e8f0;
          color: #475569;
        }
        
        /* 메타 정보 스타일 */
        .meta-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }
        
        .meta-info svg {
          width: 16px;
          height: 16px;
        }
      `}</style>

      <HeaderComponent />
      <SubTitleComponent title={post.title} />

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 뒤로가기 버튼 */}
          <div style={{ marginBottom: '2rem' }}>
            <Link 
              to="/infographic" 
              className="action-btn secondary-btn"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
              목록으로 돌아가기
            </Link>
          </div>

          {/* 인포그래픽 정보 */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '3rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '2rem',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#6ECD8E',
                  color: 'white',
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '15px',
                  marginBottom: '1rem'
                }}>
                  {post.category}
                </div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 1rem 0'
                }}>
                  {post.title}
                </h2>
                <p style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {post.description}
                </p>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                minWidth: '200px'
              }}>
                <button
                  onClick={() => handleDownload(post.pdfUrl, `${post.title}.pdf`)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: '#6ECD8E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5bb382';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6ECD8E';
                  }}
                >
                  📄 PDF 다운로드
                </button>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#888'
                }}>
                  <span>조회 {post.views}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 인포그래픽 이미지 */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            {!imageLoaded && !imageError && (
              <div style={{
                height: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                fontSize: '1.1rem',
                color: '#666'
              }}>
                이미지를 불러오는 중...
              </div>
            )}
            
            {imageError && (
              <div style={{
                height: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                fontSize: '1.1rem',
                color: '#999',
                border: '2px dashed #ddd'
              }}>
                이미지를 불러올 수 없습니다
              </div>
            )}
            
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: imageLoaded ? 'block' : 'none'
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              onClick={() => {
                // 이미지 확대 기능 (새 창에서 열기)
                window.open(post.imageUrl, '_blank');
              }}
            />
            
            {imageLoaded && (
              <div style={{
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                클릭하면 크게 볼 수 있습니다
              </div>
            )}
          </div>

          {/* 상세 내용 */}
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '3rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#333',
              marginBottom: '2rem',
              borderBottom: '2px solid #6ECD8E',
              paddingBottom: '0.5rem'
            }}>
              상세 정보
            </h3>
            <div style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#444',
              whiteSpace: 'pre-line'
            }}>
              {post.content}
            </div>
          </div>

          {/* 하단 네비게이션 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <Link
              to="/infographic"
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#6ECD8E',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5bb382';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6ECD8E';
              }}
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#f8f9fa', padding: '3rem 0', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>서울대학교 탄소중립 캠퍼스</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>08826 서울특별시 관악구 관악로 1</p>
              <p style={{ color: '#666', lineHeight: '1.6' }}>전화: 02-880-5114</p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>바로가기</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="/greenhouse-gas" style={{ color: '#666', textDecoration: 'none' }}>온실가스 현황</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/energy" style={{ color: '#666', textDecoration: 'none' }}>에너지 관리</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/solar-power" style={{ color: '#666', textDecoration: 'none' }}>태양광 발전</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>관련 사이트</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>서울대학교</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>환경부</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>한국환경공단</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>&copy; 2024 Seoul National University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 헤더 컴포넌트
const HeaderComponent = () => (
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
);

// 서브 타이틀 컴포넌트
const SubTitleComponent = ({ title }) => (
  <section className="sub-title-section">
    <div className="gradient-circles">
      <div className="gradient-circle gradient-circle-1"></div>
      <div className="gradient-circle gradient-circle-2"></div>
      <div className="gradient-circle gradient-circle-3"></div>
    </div>
    <div className="sub-title-content">
      <h1 style={{ color: '#6ECD8E' }}>{title}</h1>
      <div className="breadcrumb">
        <span style={{ color: '#333' }}>홈</span>
        <span style={{ color: '#333' }}>&gt;</span>
        <span style={{ color: '#333' }}>그린레포트</span>
        <span style={{ color: '#333' }}>&gt;</span>
        <span style={{ color: '#333' }}>인포그래픽</span>
        <span style={{ color: '#333' }}>&gt;</span>
        <span style={{ color: '#6ECD8E', fontWeight: '600' }}>{title}</span>
      </div>
    </div>
  </section>
);

export default InfographicDetail; 