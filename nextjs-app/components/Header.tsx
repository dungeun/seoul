'use client';

import React, { useState, useEffect } from 'react';

interface HeaderProps {
  currentPage?: string;
}

interface MenuItem {
  id: number;
  name: string;
  url: string;
  type: 'page' | 'board' | 'link';
  page_id?: number | null;
  board_id?: number | null;
  sort_order: number;
  is_active: number;
  content?: string;
  children?: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ currentPage = '' }) => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 브라우저 환경에서만 localStorage 접근
    if (typeof window !== 'undefined') {
      try {
        const cachedMenus = localStorage.getItem('cached-menus');
        const cacheExpiry = localStorage.getItem('cached-menus-expiry');
        
        if (cachedMenus && cacheExpiry && new Date().getTime() < parseInt(cacheExpiry)) {
          setMenus(JSON.parse(cachedMenus));
          setLoading(false);
        }
      } catch (error) {
        console.error('캐시 로드 실패:', error);
      }
    }
    
    // 백그라운드에서 최신 메뉴 가져오기
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/public/menus');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
        
        // 브라우저 환경에서만 로컬 스토리지에 캐시 저장
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cached-menus', JSON.stringify(data));
            localStorage.setItem('cached-menus-expiry', String(new Date().getTime() + 3600000));
          } catch (error) {
            console.error('캐시 저장 실패:', error);
          }
        }
      } else {
        throw new Error('메뉴 응답 오류');
      }
    } catch (error) {
      console.error('메뉴 로딩 실패:', error);
      // 캐시된 메뉴가 없는 경우에만 기본 메뉴 설정
      if (menus.length === 0) {
        setMenus([
          { id: 1, name: '온실가스', url: '/greenhouse-gas', type: 'page', sort_order: 1, is_active: 1 },
          { id: 2, name: '에너지', url: '/energy', type: 'page', sort_order: 2, is_active: 1 },
          { id: 3, name: '태양광 발전', url: '/solar-power', type: 'page', sort_order: 3, is_active: 1 },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLinkHref = (menu: MenuItem) => {
    if (menu.type === 'link') {
      return menu.url;
    }
    return menu.url;
  };

  const isExternal = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  if (loading) {
    return (
      <header className="header">
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
          
          .nav-loading {
            padding: 20px;
            color: #666;
            font-size: 14px;
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
            white-space: nowrap;
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
        <div className="header-container">
          <div className="logo">
            <a href="/">
              <img src="/img/main_logo.png" alt="서울대학교 탄소중립 캠퍼스" />
            </a>
          </div>
          <nav className="navigation">
            <div className="nav-loading">메뉴 로딩중...</div>
          </nav>
        </div>
      </header>
    );
  }

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
              {menus.map((menu) => (
                <li key={menu.id} className="nav-item">
                  {menu.children && menu.children.length > 0 ? (
                    // 하위 메뉴가 있는 경우 클릭 불가능한 메뉴로 표시
                    <>
                      <span className="nav-link" style={{ cursor: 'pointer' }}>
                        {menu.name}
                      </span>
                      <div className="dropdown-menu">
                        {menu.children.map((child) => (
                          <a 
                            key={child.id}
                            href={getLinkHref(child)} 
                            className="dropdown-item"
                            target={isExternal(child.url) ? '_blank' : '_self'}
                            rel={isExternal(child.url) ? 'noopener noreferrer' : undefined}
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    // 하위 메뉴가 없는 경우 일반 링크
                    <a 
                      href={getLinkHref(menu)}
                      className={`nav-link ${currentPage === menu.url.replace('/', '') ? 'active' : ''}`}
                      target={isExternal(menu.url) ? '_blank' : '_self'}
                      rel={isExternal(menu.url) ? 'noopener noreferrer' : undefined}
                    >
                      {menu.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;