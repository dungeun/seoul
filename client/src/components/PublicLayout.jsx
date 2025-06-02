import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function PublicLayout() {
  const [menus, setMenus] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/menus/public');
      if (response.ok) {
        const data = await response.json();
        setMenus(data);
      }
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  서울대학교 탄소중립포털
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menus.map((menu) => (
                  <Link
                    key={menu.id}
                    to={menu.url}
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    {menu.name}
                  </Link>
                ))}
                {/* 하드코딩된 메뉴 추가 */}
                <Link
                  to="/greenhouse-gas"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  온실가스
                </Link>
                <Link
                  to="/energy"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                >
                  에너지
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                관리자 로그인
              </Link>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">메뉴 열기</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {menus.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.url}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {menu.name}
                </Link>
              ))}
              {/* 하드코딩된 메뉴 추가 */}
              <Link
                to="/greenhouse-gas"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                온실가스
              </Link>
              <Link
                to="/energy"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                에너지
              </Link>
              <Link
                to="/login"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                관리자 로그인
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 서울대학교 탄소중립포털. All rights reserved.</p>
            <p className="mt-2">
              주소: 서울특별시 관악구 관악로 1 | 전화: 02-880-5114
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}