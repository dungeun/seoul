import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  PhotoIcon, 
  TagIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  TableCellsIcon,
  DocumentIcon,
  BeakerIcon,
  SparklesIcon,
  BoltIcon,
  SunIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  PhotoIcon as PhotoIconSolid,
  TagIcon as TagIconSolid,
  Bars3BottomLeftIcon as Bars3BottomLeftIconSolid,
  TableCellsIcon as TableCellsIconSolid,
  DocumentIcon as DocumentIconSolid,
  BoltIcon as BoltIconSolid,
  SunIcon as SunIconSolid,
  PresentationChartLineIcon as PresentationChartLineIconSolid
} from '@heroicons/react/24/solid';

export default function Layout({ handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: '대시보드', href: '/admin/dashboard', icon: HomeIcon },
    { name: '히어로 슬라이드 관리', href: '/admin/hero-slides', icon: PresentationChartLineIcon },
    { name: '메뉴/페이지 관리', href: '/admin/menus', icon: Bars3BottomLeftIcon },
    { name: '게시판 관리', href: '/admin/boards', icon: TableCellsIcon },
    { name: '게시글 관리', href: '/admin/posts', icon: DocumentTextIcon },
    { name: '파일 관리', href: '/admin/files', icon: PhotoIcon },
    { name: '카테고리 관리', href: '/admin/categories', icon: TagIcon },
    { name: '에너지 데이터 관리', href: '/admin/energy-data', icon: BoltIcon },
    { name: '태양광 발전 관리', href: '/admin/solar-data', icon: SunIcon },
  ];

  const onLogout = async () => {
    if (handleLogout) {
      await handleLogout();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
        <div className="w-72 h-full bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
          {/* Logo/Brand Area */}
          <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-700 border-b border-slate-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative flex flex-col items-center justify-center h-full px-6">
              <img src="/m_logo.png" alt="서울대학교 로고" className="h-16 w-auto mb-3 drop-shadow-lg" />
              <h2 className="text-white font-bold text-center leading-tight">
                <span className="block text-sm opacity-90 tracking-wide">서울대학교</span>
                <span className="block text-lg mt-1">탄소중립포털 CMS</span>
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = isActive ? 
                (item.name === '대시보드' ? HomeIconSolid :
                 item.name === '히어로 슬라이드 관리' ? PresentationChartLineIconSolid :
                 item.name === '메뉴/페이지 관리' ? Bars3BottomLeftIconSolid :
                 item.name === '게시판 관리' ? TableCellsIconSolid :
                 item.name === '게시글 관리' ? DocumentTextIconSolid :
                 item.name === '파일 관리' ? PhotoIconSolid :
                 item.name === '카테고리 관리' ? TagIconSolid :
                 item.name === '에너지 데이터 관리' ? BoltIconSolid :
                 item.name === '태양광 발전 관리' ? SunIconSolid : item.icon) 
                : item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transform scale-105'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:transform hover:translate-x-1'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 ${
                    isActive ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <SparklesIcon className="h-4 w-4 ml-auto animate-spin-slow" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <div className="border-t border-slate-700 pt-4">
              <button
                onClick={onLogout}
                className="group flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-lg lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              서울대학교 탄소중립포털 CMS
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}