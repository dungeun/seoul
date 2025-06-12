'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRealtimeData } from '@/lib/hooks/useRealtimeData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  BoltIcon, 
  SunIcon, 
  CloudIcon, 
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  stats: {
    electricity: { value: number; change: number; unit: string };
    solar: { value: number; change: number; unit: string };
    greenhouse: { value: number; change: number; unit: string };
    buildings: { value: number; change: number; unit: string };
  };
  charts: {
    monthlyEnergy: Array<{ year: number; month: number; electricity: number; gas: number; water: number }>;
    monthlySolar: Array<{ year: number; month: number; generation: number }>;
    monthlyEmissions: Array<{ year: number; month: number; emissions: number }>;
  };
  recentActivities: Array<{ type: string; building_name: string; created_at: string }>;
}

function DashboardContent() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [updateCount, setUpdateCount] = useState(0);
  
  // 실시간 데이터 훅 사용
  const { isConnected, lastMessage, reconnectAttempts } = useRealtimeData();

  // 초기 데이터 로드
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 실시간 데이터 연결 상태 관리
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else if (reconnectAttempts > 0) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [isConnected, reconnectAttempts]);

  // 실시간 업데이트 처리
  useEffect(() => {
    if (lastMessage && lastMessage.type !== 'heartbeat') {
      setUpdateCount(prev => prev + 1);
      // 데이터 새로고침
      fetchDashboardData();
    }
  }, [lastMessage]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4" />;
    if (change < 0) return <ArrowTrendingDownIcon className="h-4 w-4" />;
    return null;
  };

  const getChangeColor = (change: number, isPositiveGood: boolean = true) => {
    if (change === 0) return 'text-gray-500';
    if (isPositiveGood) {
      return change > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return change > 0 ? 'text-red-600' : 'text-green-600';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <div className="animate-ping absolute inset-0 rounded-full h-16 w-16 border-2 border-blue-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 mt-8">
        데이터를 불러올 수 없습니다.
      </div>
    );
  }

  const statCards = [
    {
      title: '총 전기 사용량',
      value: data.stats.electricity.value,
      unit: data.stats.electricity.unit,
      change: data.stats.electricity.change,
      icon: BoltIcon,
      color: 'from-blue-500 to-indigo-600',
      isPositiveGood: false
    },
    {
      title: '태양광 발전량',
      value: data.stats.solar.value,
      unit: data.stats.solar.unit,
      change: data.stats.solar.change,
      icon: SunIcon,
      color: 'from-yellow-500 to-orange-600',
      isPositiveGood: true
    },
    {
      title: '온실가스 배출량',
      value: data.stats.greenhouse.value,
      unit: data.stats.greenhouse.unit,
      change: data.stats.greenhouse.change,
      icon: CloudIcon,
      color: 'from-green-500 to-emerald-600',
      isPositiveGood: false
    },
    {
      title: '관리 건물 수',
      value: data.stats.buildings.value,
      unit: data.stats.buildings.unit,
      change: data.stats.buildings.change,
      icon: BuildingOfficeIcon,
      color: 'from-purple-500 to-pink-600',
      isPositiveGood: true
    }
  ];

  // 차트 데이터 준비
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  const energyChartData = data.charts.monthlyEnergy.map(item => ({
    month: monthNames[item.month - 1],
    전기: item.electricity,
    가스: item.gas,
    수도: item.water
  }));

  const emissionsChartData = data.charts.monthlyEmissions.map(item => ({
    month: monthNames[item.month - 1],
    배출량: item.emissions
  }));

  const solarChartData = data.charts.monthlySolar.map(item => ({
    month: monthNames[item.month - 1],
    발전량: item.generation
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <p className="text-gray-600 mt-2">에너지 데이터 관리 및 모니터링</p>
        </div>
        
        {/* 실시간 연결 상태 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">연결됨</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent"></div>
                <span className="text-sm font-medium text-yellow-600">연결 대기 중</span>
              </>
            ) : (
              <>
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">연결 끊김</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            최근 업데이트: <span className="font-medium">{updateCount}건</span>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-lg shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center text-sm font-semibold ${getChangeColor(card.change, card.isPositiveGood)}`}>
                {getChangeIcon(card.change)}
                <span className="ml-1">{formatChange(card.change)}</span>
                <span className="text-xs text-gray-500 ml-1">전월 대비</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{formatNumber(card.value)}</p>
                <span className="ml-2 text-sm text-gray-500">{card.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">주의</p>
              <p className="text-xs text-gray-600">일부 센서 점검 필요</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">실시간 연결</p>
              <p className="text-xs text-gray-600">{connectionStatus === 'connected' ? '정상 작동' : '연결 끊김'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <BoltIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">최근 업데이트</p>
              <p className="text-xs text-gray-600">{updateCount}건</p>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 에너지 사용량 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">월별 에너지 사용량</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">관리자 뷰</span>
          </div>
          {energyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="전기" fill="#3B82F6" />
                <Bar dataKey="가스" fill="#10B981" />
                <Bar dataKey="수도" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              차트 데이터 준비 중...
            </div>
          )}
        </div>

        {/* 월별 온실가스 배출량 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">월별 온실가스 배출량</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">관리자 뷰</span>
          </div>
          {emissionsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emissionsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="배출량" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              차트 데이터 준비 중...
            </div>
          )}
        </div>

        {/* 월별 태양광 발전량 */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">월별 태양광 발전량</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">관리자 뷰</span>
          </div>
          {solarChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={solarChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="발전량" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              차트 데이터 준비 중...
            </div>
          )}
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">최근 활동</h2>
        <div className="space-y-3">
          {data.recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-center space-x-3">
                {activity.type === 'energy' ? (
                  <BoltIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.type === 'energy' ? '새로운 에너지 데이터가 업데이트되었습니다.' : '태양광 발전량 데이터가 업데이트되었습니다.'}
                  </p>
                  <p className="text-xs text-gray-500">{activity.building_name}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{formatDateTime(activity.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}