'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DocumentTextIcon, PhotoIcon, TagIcon, EyeIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface Stats {
  posts: number;
  files: number;
  categories: number;
  views: number;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
  trendUp: boolean | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    files: 0,
    categories: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const monthlyPostsData = [
    { month: '1월', posts: 12 },
    { month: '2월', posts: 19 },
    { month: '3월', posts: 15 },
    { month: '4월', posts: 25 },
    { month: '5월', posts: 22 },
    { month: '6월', posts: 30 },
  ];

  const categoryData = [
    { name: '공지사항', value: 35, color: '#3B82F6' },
    { name: '일반', value: 25, color: '#10B981' },
    { name: '자료', value: 20, color: '#F59E0B' },
    { name: '기타', value: 20, color: '#EF4444' },
  ];

  const viewsData = [
    { day: '월', views: 1200 },
    { day: '화', views: 1900 },
    { day: '수', views: 1600 },
    { day: '목', views: 2100 },
    { day: '금', views: 2400 },
    { day: '토', views: 1800 },
    { day: '일', views: 1500 },
  ];

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Use sample data for demo
          setStats({
            posts: 156,
            files: 423,
            categories: 12,
            views: 8432
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Use sample data for demo
        setStats({
          posts: 156,
          files: 423,
          categories: 12,
          views: 8432
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    { title: '전체 게시글', value: stats.posts, icon: DocumentTextIcon, color: 'from-blue-500 to-indigo-600', trend: '+12%', trendUp: true },
    { title: '전체 파일', value: stats.files, icon: PhotoIcon, color: 'from-green-500 to-emerald-600', trend: '+8%', trendUp: true },
    { title: '카테고리', value: stats.categories, icon: TagIcon, color: 'from-yellow-500 to-orange-600', trend: '0%', trendUp: null },
    { title: '전체 조회수', value: stats.views, icon: EyeIcon, color: 'from-purple-500 to-pink-600', trend: '+24%', trendUp: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="animate-ping absolute inset-0 rounded-full h-12 w-12 border-2 border-blue-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600 mt-2">서울대학교 탄소중립포털 CMS 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div 
            key={card.title} 
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6 animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${card.color} p-4 rounded-xl shadow-lg`}>
                <card.icon className="h-8 w-8 text-white" />
              </div>
              {card.trend && (
                <div className={`flex items-center text-sm font-semibold ${
                  card.trendUp ? 'text-green-600' : card.trendUp === false ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {card.trendUp !== null && (
                    card.trendUp ? 
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : 
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {card.trend}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Posts Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">월별 게시글</h2>
            <span className="text-sm text-gray-500">최근 6개월</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyPostsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="posts" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">카테고리 분포</h2>
            <span className="text-sm text-gray-500">전체 게시글 기준</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Views */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">주간 조회수</h2>
            <span className="text-sm text-gray-500">지난 7일간</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{ fill: '#3B82F6', r: 6 }} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}