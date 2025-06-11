'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import useSWR from 'swr';
import BaseChart from './BaseChart';
import { formatNumber } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface SolarChartProps {
  type?: 'bar' | 'line';
  year?: number;
  building?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  showCapacity?: boolean;
}

interface SolarDataPoint {
  month: number;
  generation: number;
  capacity: number;
  building_name: string;
}

interface ChartDataPoint {
  month: string;
  generation: number;
  capacity: number;
  efficiency: number;
}

const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export default function SolarChart({
  type = 'bar',
  year = new Date().getFullYear(),
  building,
  title,
  subtitle,
  className,
  showCapacity = false,
}: SolarChartProps) {
  // API 데이터 페칭
  const { data, error, isLoading } = useSWR(
    `/api/solar?year=${year}${building ? `&building=${building}` : ''}`,
    fetcher,
    {
      refreshInterval: 30000, // 30초마다 갱신
      revalidateOnFocus: false,
    }
  );

  // 차트 데이터 가공
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    const solarData = data.data as SolarDataPoint[];

    // 월별로 그룹화하여 합계 계산
    const monthlyData = solarData.reduce((acc, item) => {
      const month = item.month;
      const monthStr = `${month}월`;

      if (!acc[month]) {
        acc[month] = {
          month: monthStr,
          generation: 0,
          capacity: 0,
          efficiency: 0,
        };
      }

      acc[month].generation += item.generation || 0;
      acc[month].capacity += item.capacity || 0;

      return acc;
    }, {} as Record<number, ChartDataPoint>);

    // 1월부터 12월까지 정렬하고 효율성 계산
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthData = monthlyData[month] || {
        month: `${month}월`,
        generation: 0,
        capacity: 0,
        efficiency: 0,
      };

      // 효율성 계산 (발전량 / 설비용량 * 100)
      if (monthData.capacity > 0) {
        monthData.efficiency = (monthData.generation / monthData.capacity) * 100;
      }

      return monthData;
    });
  }, [data]);

  // 차트 색상 정의
  const chartColors = {
    generation: '#FF9800',
    capacity: '#FFC107',
    efficiency: '#4CAF50',
  };

  // 데이터 타입에 따른 렌더링
  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
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
            formatter={(value: number, name: string) => {
              if (name === 'efficiency') {
                return [`${value.toFixed(1)}%`, '발전 효율'];
              }
              return [
                `${formatNumber(value)} kWh`,
                name === 'generation' ? '발전량' : '설비용량',
              ];
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey="generation"
            stroke={chartColors.generation}
            strokeWidth={3}
            dot={{ fill: chartColors.generation, r: 6 }}
            activeDot={{ r: 8 }}
          />
          {showCapacity && (
            <Line
              type="monotone"
              dataKey="capacity"
              stroke={chartColors.capacity}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: chartColors.capacity, r: 4 }}
            />
          )}
          <Legend />
        </LineChart>
      );
    }

    return (
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="month"
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
          formatter={(value: number, name: string) => {
            if (name === 'efficiency') {
              return [`${value.toFixed(1)}%`, '발전 효율'];
            }
            return [
              `${formatNumber(value)} kWh`,
              name === 'generation' ? '발전량' : '설비용량',
            ];
          }}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar
          dataKey="generation"
          fill={chartColors.generation}
          radius={[4, 4, 0, 0]}
        />
        {showCapacity && (
          <Bar
            dataKey="capacity"
            fill={chartColors.capacity}
            radius={[4, 4, 0, 0]}
            fillOpacity={0.6}
          />
        )}
        <Legend />
      </BarChart>
    );
  };

  const getDefaultTitle = () => {
    if (title) return title;
    return `${year}년 태양광 발전량`;
  };

  // 총 발전량 계산
  const totalGeneration = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.generation, 0);
  }, [chartData]);

  // 평균 효율성 계산
  const averageEfficiency = useMemo(() => {
    const validMonths = chartData.filter(item => item.efficiency > 0);
    if (validMonths.length === 0) return 0;
    
    const totalEfficiency = validMonths.reduce((sum, item) => sum + item.efficiency, 0);
    return totalEfficiency / validMonths.length;
  }, [chartData]);

  const actions = (
    <div className="flex items-center gap-4 text-sm">
      <div className="text-center">
        <div className="text-gray-500">총 발전량</div>
        <div className="font-semibold text-orange-600">
          {formatNumber(totalGeneration)} kWh
        </div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">평균 효율</div>
        <div className="font-semibold text-green-600">
          {averageEfficiency.toFixed(1)}%
        </div>
      </div>
    </div>
  );

  return (
    <BaseChart
      title={getDefaultTitle()}
      subtitle={subtitle || (building ? `${building} 건물` : '전체 건물')}
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