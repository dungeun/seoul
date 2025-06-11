'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Bars3BottomLeftIcon,
  TableCellsIcon,
  SparklesIcon,
  BoltIcon,
  SunIcon,
  PresentationChartLineIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  TagIcon as TagIconSolid,
  Bars3BottomLeftIcon as Bars3BottomLeftIconSolid,
  TableCellsIcon as TableCellsIconSolid,
  BoltIcon as BoltIconSolid,
  SunIcon as SunIconSolid,
  PresentationChartLineIcon as PresentationChartLineIconSolid,
  LinkIcon as LinkIconSolid
} from '@heroicons/react/24/solid';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: '히어로 슬라이드 관리', href: '/admin/hero-slides', icon: PresentationChartLineIcon },
  { name: '메뉴/페이지 관리', href: '/admin/menus', icon: Bars3BottomLeftIcon },
  { name: '게시판 관리', href: '/admin/boards', icon: TableCellsIcon },
  { name: '게시글 관리', href: '/admin/posts', icon: DocumentTextIcon },
  { name: '링크 게시판 관리', href: '/admin/link-posts', icon: LinkIcon },
  { name: '에너지 데이터 관리', href: '/admin/energy-data', icon: BoltIcon },
  { name: '태양광 발전 관리', href: '/admin/solar-data', icon: SunIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        router.push('/admin/login');
      }
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}>
        <div className="w-72 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700">
          {/* Logo/Brand Area */}
          <div className="relative" style={{ backgroundColor: '#1A2538' }}>
            <div className="flex flex-col items-center justify-center px-6 py-8">
              <img src="/m_logo.png" alt="서울대학교 로고" className="h-16 w-auto mb-4" />
              <h2 className="text-white font-bold text-center leading-tight">
                <span className="block text-base tracking-wide font-semibold">서울대학교</span>
                <span className="block text-xl mt-1 font-bold tracking-tight">탄소중립포털 CMS</span>
              </h2>
            </div>
            
            {/* 컬러 바 */}
            <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 lg:hidden text-gray-300 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-8 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = isActive ? 
                (item.name === '대시보드' ? HomeIconSolid :
                 item.name === '히어로 슬라이드 관리' ? PresentationChartLineIconSolid :
                 item.name === '메뉴/페이지 관리' ? Bars3BottomLeftIconSolid :
                 item.name === '게시판 관리' ? TableCellsIconSolid :
                 item.name === '게시글 관리' ? DocumentTextIconSolid :
                 item.name === '링크 게시판 관리' ? LinkIconSolid :
                 item.name === '에너지 데이터 관리' ? BoltIconSolid :
                 item.name === '태양광 발전 관리' ? SunIconSolid : item.icon) 
                : item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 transform scale-105 border border-blue-400/20'
                      : 'text-slate-300 hover:bg-slate-700/70 hover:text-white hover:transform hover:translate-x-1 hover:shadow-md'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-transform duration-200 ${
                    isActive ? 'animate-pulse' : 'group-hover:scale-110'
                  }`} />
                  <span className="font-medium text-sm">{item.name}</span>
                  {isActive && (
                    <SparklesIcon className="h-4 w-4 ml-auto animate-spin-slow" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 w-full p-4">
            <div className="border-t border-slate-600 pt-4">
              <button
                onClick={onLogout}
                className="group flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 hover:shadow-md"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 lg:hidden">
          <div className="flex items-center justify-between h-20 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              서울대학교 탄소중립포털 CMS
            </h1>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Desktop header bar */}
        <div className="hidden lg:block sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/50">
          <div className="h-16 px-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              관리자 대시보드
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                환영합니다, <span className="font-semibold text-gray-900">관리자</span>님
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-8 min-h-screen">
          <div className="max-w-[1440px] mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8 animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 