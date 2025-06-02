import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TableCellsIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function BoardView() {
  const { slug } = useParams();
  const [board, setBoard] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, [slug]);

  const fetchBoardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch board info
      const boardResponse = await axios.get(`/api/boards/${slug}`);
      setBoard(boardResponse.data);

      // Fetch posts for this board
      const postsResponse = await axios.get(`/api/boards/${slug}/posts`);
      setPosts(postsResponse.data);
    } catch (error) {
      console.error('Failed to fetch board data:', error);
      if (error.response?.status === 404) {
        setError('게시판을 찾을 수 없습니다.');
      } else {
        setError('게시판을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <TableCellsIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">오류</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
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
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        {/* CSS 스타일 추가 */}
        <style>{`
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
            <h1 style={{ color: '#6ECD8E' }}>{board.name}</h1>
            <div className="breadcrumb">
              <span style={{ color: '#333' }}>홈</span>
              <span style={{ color: '#333' }}>&gt;</span>
              <span style={{ color: '#333' }}>온실가스</span>
              <span style={{ color: '#333' }}>&gt;</span>
              <span style={{ color: '#6ECD8E', fontWeight: '600' }}>{board.name}</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem' }}>
            {board.description && (
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#F5FDE7', borderRadius: '8px' }}>
                <p style={{ color: '#666', margin: 0 }}>{board.description}</p>
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      번호
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      작성일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.length > 0 ? (
                    posts.map((post, index) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {posts.length - index}
                        </td>
                        <td className="px-6 py-4">
                          <Link 
                            to={`/post/${post.slug || post.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">게시글이 없습니다.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
    </div>
  );
}