'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  BoltIcon, 
  SunIcon, 
  CloudIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
// 차트 컴포넌트 임시 대체
const EnergyChart = ({ title, subtitle }: any) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
    <div className="mt-4 bg-gray-100 rounded-lg p-8">
      <p className="text-gray-500">차트 데이터 준비 중...</p>
    </div>
  </div>
);

const SolarChart = ({ title, subtitle }: any) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
    <div className="mt-4 bg-gray-100 rounded-lg p-8">
      <p className="text-gray-500">차트 데이터 준비 중...</p>
    </div>
  </div>
);

const GreenhouseGasChart = ({ title, subtitle }: any) => (
  <div className="text-center py-8">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-500">{subtitle}</p>
    <div className="mt-4 bg-gray-100 rounded-lg p-8">
      <p className="text-gray-500">차트 데이터 준비 중...</p>
    </div>
  </div>
);
// formatNumber 함수 정의
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ko-KR').format(num);
};

interface AdminStats {
  totalEnergy: number;
  totalSolar: number;
  totalEmission: number;
  totalBuildings: number;
  recentUpdates: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}

interface EnergyApiData {
  totals: {
    total_electricity: number;
    total_gas: number;
  };
  solarTotal: number;
}

interface GreenhouseApiData {
  totalEmission: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 실시간 데이터 연결 (임시로 비활성화)
  const isConnected = false;
  const lastMessage: { timestamp: string } | null = null;

  // 초기 데이터 로드
  useEffect(() => {
    const loadStats = async () => {
      try {
        // 에너지 데이터 가져오기
        const energyResponse = await fetch('/api/public/energy-stats');
        const energyData = energyResponse.ok ? await energyResponse.json() : null;

        // 건물 데이터 가져오기
        const buildingsResponse = await fetch('/api/buildings');
        const buildingsData = buildingsResponse.ok ? await buildingsResponse.json() : [];

        // 온실가스 데이터 가져오기
        const greenhouseResponse = await fetch('/api/public/greenhouse-gas-stats');
        const greenhouseData = greenhouseResponse.ok ? await greenhouseResponse.json() : null;

        setStats({
          totalEnergy: energyData?.data?.totals?.total_electricity || 0,
          totalSolar: energyData?.data?.solarTotal || 0,
          totalEmission: greenhouseData?.data?.totalEmission || 0,
          totalBuildings: Array.isArray(buildingsData.data) ? buildingsData.data.length : 0,
          recentUpdates: 24, // Mock data
          systemStatus: isConnected ? 'healthy' : 'warning',
        });
      } catch (error) {
        console.error('관리자 통계 로딩 오류:', error);
        setStats({
          totalEnergy: 0,
          totalSolar: 0,
          totalEmission: 0,
          totalBuildings: 0,
          recentUpdates: 0,
          systemStatus: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isConnected]);

  const statsCards = [
    {
      title: '총 전기 사용량',
      value: stats?.totalEnergy || 0,
      unit: 'kWh',
      icon: BoltIcon,
      color: 'blue',
      change: '+5.2%',
      changeType: 'increase' as const,
    },
    {
      title: '태양광 발전량',
      value: stats?.totalSolar || 0,
      unit: 'kWh',
      icon: SunIcon,
      color: 'orange',
      change: '+12.1%',
      changeType: 'increase' as const,
    },
    {
      title: '온실가스 배출량',
      value: stats?.totalEmission || 0,
      unit: 'tCO₂eq',
      icon: CloudIcon,
      color: 'green',
      change: '-3.4%',
      changeType: 'decrease' as const,
    },
    {
      title: '관리 건물 수',
      value: stats?.totalBuildings || 0,
      unit: '개',
      icon: BuildingOfficeIcon,
      color: 'purple',
      change: '+2',
      changeType: 'increase' as const,
    },
  ];

  const systemCards = [
    {
      title: '시스템 상태',
      value: stats?.systemStatus === 'healthy' ? '정상' : stats?.systemStatus === 'warning' ? '주의' : '오류',
      icon: stats?.systemStatus === 'healthy' ? CheckCircleIcon : ExclamationTriangleIcon,
      color: stats?.systemStatus === 'healthy' ? 'green' : stats?.systemStatus === 'warning' ? 'yellow' : 'red',
    },
    {
      title: '실시간 연결',
      value: isConnected ? '연결됨' : '연결 끊김',
      icon: ChartBarIcon,
      color: isConnected ? 'green' : 'red',
    },
    {
      title: '최근 업데이트',
      value: `${stats?.recentUpdates || 0}건`,
      icon: UsersIcon,
      color: 'blue',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">관리자 데이터를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600">에너지 데이터 관리 및 모니터링</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              연결 대기 중
            </span>
          </div>
        </div>

        {/* 주요 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(card.value)} {card.unit}
                  </p>
                  <p className={`text-sm ${
                    card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change} 전월 대비
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 시스템 상태 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {systemCards.map((card) => (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${card.color}-100`}>
                  <card.icon className={`h-5 w-5 text-${card.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-lg font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 에너지 사용량 차트 */}
          <div className="bg-white rounded-lg shadow p-6">
            <EnergyChart
              type="line"
              dataType="all"
              title="월별 에너지 사용량"
              subtitle="관리자 뷰"
            />
          </div>

          {/* 온실가스 배출량 차트 */}
          <div className="bg-white rounded-lg shadow p-6">
            <GreenhouseGasChart
              type="bar"
              chartType="monthly"
              title="월별 온실가스 배출량"
              subtitle="관리자 뷰"
            />
          </div>
        </div>

        {/* 태양광 발전량 차트 */}
        <div className="bg-white rounded-lg shadow p-6">
          <SolarChart
            type="bar"
            title="월별 태양광 발전량"
            subtitle="관리자 뷰"
            showCapacity={true}
          />
        </div>

        {/* 최근 활동 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">새로운 에너지 데이터가 업데이트되었습니다.</p>
                  <p className="text-xs text-gray-500">5분 전</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">태양광 발전량 데이터가 업데이트되었습니다.</p>
                  <p className="text-xs text-gray-500">12분 전</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-orange-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">새로운 건물이 등록되었습니다.</p>
                  <p className="text-xs text-gray-500">1시간 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 