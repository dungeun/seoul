'use client';

import { useState, useEffect } from 'react';
import { useRealtimeDataByType } from '@/lib/hooks/useRealtimeData';
import { 
  BoltIcon, 
  SunIcon, 
  CloudIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SignalIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
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
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// 숫자 애니메이션 컴포넌트
const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {displayValue.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
      {suffix}
    </span>
  );
};

export default function RealtimePage() {
  // 실시간 데이터 훅 사용
  const energyData = useRealtimeDataByType('energy_update');
  const solarData = useRealtimeDataByType('solar_update');
  const greenhouseData = useRealtimeDataByType('greenhouse_update');
  
  // 차트 데이터 상태
  const [energyChartData, setEnergyChartData] = useState<any[]>([]);
  const [solarChartData, setSolarChartData] = useState<any[]>([]);
  const [emissionTrend, setEmissionTrend] = useState<any[]>([]);
  const [buildingData, setBuildingData] = useState<any[]>([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // 현재 통계
  const [currentStats, setCurrentStats] = useState({
    totalElectricity: 0,
    totalGas: 0,
    totalWater: 0,
    totalSolar: 0,
    totalEmission: 0,
    reductionRate: 0
  });
  
  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await fetch('/api/realtime/initial');
        if (response.ok) {
          const result = await response.json();
          
          // 통계 설정
          setCurrentStats({
            totalElectricity: result.data.stats.totalElectricity,
            totalGas: result.data.stats.totalGas,
            totalWater: 0, // water 데이터 추가 필요
            totalSolar: result.data.stats.totalSolar,
            totalEmission: result.data.stats.totalEmission,
            reductionRate: parseFloat(result.data.stats.reductionRate)
          });
          
          // 차트 데이터 설정 (월별 트렌드)
          if (result.data.monthlyTrend) {
            const chartData = result.data.monthlyTrend.map((item: any) => ({
              time: `${item.month}월`,
              electricity: item.electricity,
              gas: item.gas,
              water: item.water
            }));
            setEnergyChartData(chartData);
          }
          
          // 건물별 최신 데이터
          if (result.data.buildingLatest) {
            setBuildingData(result.data.buildingLatest);
          }
          
          // 배출량 트렌드 초기화
          if (result.data.monthlyTrend) {
            const emissionData = result.data.monthlyTrend.map((item: any) => ({
              time: `${item.month}월`,
              emission: (item.electricity * 0.4781 + item.gas * 2.176) / 1000,
              electricity: (item.electricity * 0.4781) / 1000,
              gas: (item.gas * 2.176) / 1000
            }));
            setEmissionTrend(emissionData);
          }
          
          setInitialDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);
  
  // 에너지 데이터 업데이트
  useEffect(() => {
    if (energyData.data && typeof energyData.data === 'object' && 'data' in energyData.data) {
      const latestData = (energyData.data as any).data;
      
      // 차트 데이터 업데이트 (최근 10개)
      setEnergyChartData(prev => {
        const newData = latestData.map((item: any) => ({
          time: new Date(item.created_at).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          building: item.building_name,
          electricity: item.electricity,
          gas: item.gas,
          water: item.water
        }));
        
        return [...prev, ...newData].slice(-10);
      });
      
      // 통계 업데이트
      const totals = latestData.reduce((acc: any, item: any) => ({
        electricity: acc.electricity + (item.electricity || 0),
        gas: acc.gas + (item.gas || 0),
        water: acc.water + (item.water || 0)
      }), { electricity: 0, gas: 0, water: 0 });
      
      setCurrentStats(prev => ({
        ...prev,
        totalElectricity: totals.electricity,
        totalGas: totals.gas,
        totalWater: totals.water
      }));
    }
  }, [energyData]);
  
  // 태양광 데이터 업데이트
  useEffect(() => {
    if (solarData.data && typeof solarData.data === 'object' && 'data' in solarData.data) {
      const latestData = (solarData.data as any).data;
      
      setSolarChartData(prev => {
        const newData = latestData.map((item: any) => ({
          time: new Date(item.created_at).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          building: item.building_name,
          generation: item.generation,
          capacity: item.capacity,
          efficiency: item.capacity > 0 ? (item.generation / item.capacity * 100) : 0
        }));
        
        return [...prev, ...newData].slice(-10);
      });
      
      const totalSolar = latestData.reduce((sum: number, item: any) => 
        sum + (item.generation || 0), 0
      );
      
      setCurrentStats(prev => ({
        ...prev,
        totalSolar
      }));
    }
  }, [solarData]);
  
  // 온실가스 데이터 업데이트
  useEffect(() => {
    if (greenhouseData.data && typeof greenhouseData.data === 'object' && 'data' in greenhouseData.data) {
      const ghgData = (greenhouseData.data as any).data;
      
      setCurrentStats(prev => ({
        ...prev,
        totalEmission: ghgData.totalEmission || 0,
        reductionRate: Math.random() * 10 + 5 // 임시 감축률
      }));
      
      // 트렌드 데이터 추가
      setEmissionTrend(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          emission: ghgData.totalEmission,
          electricity: ghgData.electricityEmission,
          gas: ghgData.gasEmission
        };
        
        return [...prev, newPoint].slice(-20);
      });
    }
  }, [greenhouseData]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              실시간 에너지 모니터링
            </h1>
            <div className="flex items-center space-x-2">
              <SignalIcon className={`h-5 w-5 ${energyData.isConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${energyData.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {energyData.isConnected ? '실시간 연결됨' : '연결 끊김'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 주요 지표 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 전기 사용량 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전기 사용량</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={currentStats.totalElectricity} suffix=" kWh" />
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  전월 대비 5.2%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BoltIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          {/* 가스 사용량 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">가스 사용량</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={currentStats.totalGas} suffix=" m³" />
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  전월 대비 3.1%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <CloudIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          {/* 태양광 발전량 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">태양광 발전</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={currentStats.totalSolar} suffix=" kWh" />
                </p>
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  전월 대비 12.5%
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <SunIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
          
          {/* 온실가스 배출량 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">온실가스 배출</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  <AnimatedNumber value={currentStats.totalEmission} suffix=" tCO₂" />
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  감축률 {currentStats.reductionRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CloudIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* 실시간 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* 에너지 사용량 실시간 차트 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              실시간 에너지 사용량
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={energyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="electricity" 
                  stackId="1"
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  name="전기(kWh)"
                />
                <Area 
                  type="monotone" 
                  dataKey="gas" 
                  stackId="1"
                  stroke="#F97316" 
                  fill="#FED7AA" 
                  name="가스(m³)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          {/* 온실가스 배출 트렌드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              온실가스 배출 트렌드
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={emissionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="emission" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="총 배출량(tCO₂)"
                />
                <Line 
                  type="monotone" 
                  dataKey="electricity" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="전기 기인"
                />
                <Line 
                  type="monotone" 
                  dataKey="gas" 
                  stroke="#F97316" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="가스 기인"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* 건물별 실시간 현황 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            건물별 실시간 현황
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    건물명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전기 (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가스 (m³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수도 (ton)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    태양광 (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업데이트
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(buildingData.length > 0 ? buildingData : energyChartData.slice(-5)).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {item.building_name || item.building}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.electricity?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.gas?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.water?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {solarChartData.find(s => s.building === (item.building_name || item.building))?.generation?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {item.time || `${item.year || 2024}년 ${item.month || 1}월`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 연결 상태 */}
        {energyData.connectionError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">연결 오류: {energyData.connectionError}</p>
          </div>
        )}
      </div>
      
      {/* 배경 애니메이션 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}