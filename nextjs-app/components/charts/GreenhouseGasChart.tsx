'use client';

import { useMemo } from 'react';
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
  ResponsiveContainer,
} from 'recharts';
import useSWR from 'swr';
import BaseChart from './BaseChart';
import { formatNumber } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface GreenhouseGasChartProps {
  type?: 'bar' | 'line' | 'pie';
  chartType?: 'monthly' | 'yearly' | 'building';
  year?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface GreenhouseGasStatsData {
  currentYear: number;
  totalEmission: number;
  previousYearEmission: number;
  reductionAmount: number;
  reductionRate: number;
  monthlyEmissions: Array<{
    month: string;
    emission: number;
  }>;
  yearlyTrend: Array<{
    year: number;
    emission: number;
  }>;
  buildingEmissions: Array<{
    name: string;
    value: number;
  }>;
}

type ChartDataType = 
  | { month: string; emission: number }
  | { year: number; emission: number }
  | { name: string; value: number; color: string };

const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export default function GreenhouseGasChart({
  type = 'bar',
  chartType = 'monthly',
  year = new Date().getFullYear(),
  title,
  subtitle,
  className,
}: GreenhouseGasChartProps) {
  // API 데이터 페칭
  const { data, error, isLoading } = useSWR(
    '/api/public/greenhouse-gas-stats',
    fetcher,
    {
      refreshInterval: 30000, // 30초마다 갱신
      revalidateOnFocus: false,
    }
  );

  // 차트 데이터 가공
  const chartData = useMemo((): ChartDataType[] => {
    if (!data?.data) return [];

    const statsData = data.data as GreenhouseGasStatsData;

    switch (chartType) {
      case 'monthly':
        return statsData.monthlyEmissions || [];
      case 'yearly':
        return statsData.yearlyTrend || [];
      case 'building':
        // 파이 차트용 색상 추가
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
        return (statsData.buildingEmissions || []).map((item, index) => ({
          ...item,
          color: colors[index % colors.length],
        }));
      default:
        return [];
    }
  }, [data, chartType]);

  // 차트 색상 정의
  const chartColors = {
    emission: '#6ECD8E',
    reduction: '#10B981',
  };

  // 데이터 타입에 따른 렌더링
  const renderChart = () => {
    if (chartType === 'building' && type === 'pie') {
      // building 차트 데이터는 color 속성을 가진다고 확신할 수 있음
      const buildingData = chartData as Array<{ name: string; value: number; color: string }>;
      
      return (
        <PieChart>
          <Pie
            data={buildingData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={130}
            dataKey="value"
            stroke="none"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {buildingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${formatNumber(value)}t`, '배출량']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
        </PieChart>
      );
    }

    if (type === 'line') {
      const dataKey = chartType === 'yearly' ? 'emission' : 'emission';
      const xDataKey = chartType === 'yearly' ? 'year' : 'month';
      
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey={xDataKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            formatter={(value: number) => [`${formatNumber(value)}t`, '배출량']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={chartColors.emission}
            strokeWidth={3}
            dot={{ fill: chartColors.emission, r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      );
    }

    // 기본 Bar Chart
    const dataKey = chartType === 'yearly' ? 'emission' : chartType === 'building' ? 'value' : 'emission';
    const xDataKey = chartType === 'yearly' ? 'year' : chartType === 'building' ? 'name' : 'month';

    return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey={xDataKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(value) => formatNumber(value)}
        />
        <Tooltip
          formatter={(value: number) => [`${formatNumber(value)}t`, '배출량']}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar
          dataKey={dataKey}
          fill={chartColors.emission}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    );
  };

  const getDefaultTitle = () => {
    if (title) return title;
    
    const typeLabels = {
      monthly: '월별',
      yearly: '연간',
      building: '건물별',
    };
    
    return `${typeLabels[chartType]} 온실가스 배출량`;
  };

  // 통계 정보 계산
  const statsInfo = useMemo(() => {
    if (!data?.data) return null;
    
    const statsData = data.data as GreenhouseGasStatsData;
    
    return {
      totalEmission: statsData.totalEmission,
      reductionAmount: statsData.reductionAmount,
      reductionRate: statsData.reductionRate,
    };
  }, [data]);

  const actions = statsInfo && (
    <div className="flex items-center gap-4 text-sm">
      <div className="text-center">
        <div className="text-gray-500">총 배출량</div>
        <div className="font-semibold text-green-600">
          {formatNumber(statsInfo.totalEmission)}t
        </div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">감축량</div>
        <div className="font-semibold text-blue-600">
          {formatNumber(statsInfo.reductionAmount)}t
        </div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">감축률</div>
        <div className="font-semibold text-purple-600">
          {statsInfo.reductionRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );

  return (
    <BaseChart
      title={getDefaultTitle()}
      subtitle={subtitle || `${year}년 기준`}
      loading={isLoading}
      error={error?.message}
      className={className}
      actions={actions}
    >
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </BaseChart>
  );
} 