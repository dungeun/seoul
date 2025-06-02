import React from 'react';

const Header = ({ currentPage = '' }) => {
  return (
    <>
      <style>{`
        /* Header Styles */
        .header {
          height: 200px;
          background: white;
          position: relative;
          z-index: 1000;
          box-shadow: none;
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
          margin-left: auto;
          margin-right: 0;
        }
        
        .nav-menu {
          display: flex;
          list-style: none;
          gap: 0;
          margin: 0;
          padding: 0;
          height: 200px;
          align-items: center;
          justify-content: flex-end;
        }
        
        .nav-item {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }
        
        .nav-link {
          display: block;
          padding: 0 15px;
          color: #424443;
          text-decoration: none;
          font-family: 'SUIT', sans-serif;
          font-weight: 500;
          font-size: 1.3rem;
          transition: all 0.3s ease;
          position: relative;
          height: 200px;
          display: flex;
          align-items: center;
        }
        
        .nav-item:last-child .nav-link {
          padding-right: 0;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background-color: #53BD6A;
          transition: width 0.3s ease;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          width: calc(100% - 30px);
        }
        
        .nav-link:hover,
        .nav-link.active {
          color: #6ECD8E;
        }
        
        /* Simple Dropdown Menu Styles */
        .dropdown-menu {
          position: absolute;
          top: 120px;
          left: 0;
          background: white;
          min-width: 200px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
          padding: 1rem 0;
        }
        
        .nav-item:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .dropdown-item {
          display: block;
          padding: 0.75rem 1.5rem;
          color: #424443;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 400;
          transition: all 0.3s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .dropdown-item:hover {
          background-color: #F5FDE7;
          color: #6ECD8E;
        }
        
        .dropdown-item:last-child {
          border-bottom: none;
        }
      `}</style>

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
                <a 
                  href="/greenhouse-gas" 
                  className={`nav-link ${currentPage === 'greenhouse-gas' ? 'active' : ''}`}
                >
                  온실가스
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="/energy" 
                  className={`nav-link ${currentPage === 'energy' ? 'active' : ''}`}
                >
                  에너지
                </a>
              </li>
              <li className="nav-item">
                <a 
                  href="/solar-power" 
                  className={`nav-link ${currentPage === 'solar-power' ? 'active' : ''}`}
                >
                  태양광 발전
                </a>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">그린캠퍼스</a>
                <div className="dropdown-menu">
                  <a href="/green-campus" className="dropdown-item">그린캠퍼스 소개</a>
                  <a href="/green-building" className="dropdown-item">친환경 건물</a>
                  <a href="/green-transport" className="dropdown-item">친환경 교통</a>
                  <a href="/waste-management" className="dropdown-item">폐기물 관리</a>
                </div>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">그린레포트</a>
                <div className="dropdown-menu">
                  <a href="/sustainability-report" className="dropdown-item">지속가능성 보고서</a>
                  <a href="/infographic" className="dropdown-item">인포그래픽</a>
                  <a href="/research-report" className="dropdown-item">연구보고서</a>
                </div>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">탄소중립연구자 네트워크</a>
                <div className="dropdown-menu">
                  <a href="/researcher-network" className="dropdown-item">연구자 소개</a>
                  <a href="/research-projects" className="dropdown-item">연구 프로젝트</a>
                  <a href="/collaboration" className="dropdown-item">협력 프로그램</a>
                  <a href="/carbon-tech" className="dropdown-item">탄소중립 기술</a>
                  <a href="/climate-research" className="dropdown-item">기후과학 연구</a>
                </div>
              </li>
              <li className="nav-item">
                <a href="#" className="nav-link">에너지 데이터 플랫폼</a>
                <div className="dropdown-menu">
                  <a href="/data-dashboard" className="dropdown-item">데이터 대시보드</a>
                  <a href="/api-docs" className="dropdown-item">API 문서</a>
                  <a href="/data-download" className="dropdown-item">데이터 다운로드</a>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header; 