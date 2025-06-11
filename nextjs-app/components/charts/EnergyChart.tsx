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

interface EnergyChartProps {
  type: 'bar' | 'line';
  dataType: 'electricity' | 'gas' | 'water' | 'all';
  year?: number;
  building?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface EnergyDataPoint {
  month: number;
  electricity: number;
  gas: number;
  water: number;
  building_name: string;
}

interface ChartDataPoint {
  month: string;
  electricity: number;
  gas: number;
  water: number;
}

const fetcher = async (url: string) => {
  const response = await apiClient.get(url);
  return response.data;
};

export default function EnergyChart({
  type = 'bar',
  dataType = 'all',
  year = new Date().getFullYear(),
  building,
  title,
  subtitle,
  className,
}: EnergyChartProps) {
  // API 데이터 페칭
  const { data, error, isLoading } = useSWR(
    `/api/energy?year=${year}${building ? `&building=${building}` : ''}`,
    fetcher,
    {
      refreshInterval: 30000, // 30초마다 갱신
      revalidateOnFocus: false,
    }
  );

  // 차트 데이터 가공
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    const energyData = data.data as EnergyDataPoint[];

    // 월별로 그룹화하여 합계 계산
    const monthlyData = energyData.reduce((acc, item) => {
      const month = item.month;
      const monthStr = `${month}월`;

      if (!acc[month]) {
        acc[month] = {
          month: monthStr,
          electricity: 0,
          gas: 0,
          water: 0,
        };
      }

      acc[month].electricity += item.electricity || 0;
      acc[month].gas += item.gas || 0;
      acc[month].water += item.water || 0;

      return acc;
    }, {} as Record<number, ChartDataPoint>);

    // 1월부터 12월까지 정렬
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return monthlyData[month] || {
        month: `${month}월`,
        electricity: 0,
        gas: 0,
        water: 0,
      };
    });
  }, [data]);

  // 차트 색상 정의
  const chartColors = {
    electricity: '#3B82F6',
    gas: '#10B981',
    water: '#F59E0B',
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
            formatter={(value: number, name: string) => [
              `${formatNumber(value)} ${getUnit(name as keyof typeof chartColors)}`,
              getLabel(name as keyof typeof chartColors),
            ]}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          />
          {(dataType === 'all' || dataType === 'electricity') && (
            <Line
              type="monotone"
              dataKey="electricity"
              stroke={chartColors.electricity}
              strokeWidth={3}
              dot={{ fill: chartColors.electricity, r: 6 }}
              activeDot={{ r: 8 }}
            />
          )}
          {(dataType === 'all' || dataType === 'gas') && (
            <Line
              type="monotone"
              dataKey="gas"
              stroke={chartColors.gas}
              strokeWidth={3}
              dot={{ fill: chartColors.gas, r: 6 }}
              activeDot={{ r: 8 }}
            />
          )}
          {(dataType === 'all' || dataType === 'water') && (
            <Line
              type="monotone"
              dataKey="water"
              stroke={chartColors.water}
              strokeWidth={3}
              dot={{ fill: chartColors.water, r: 6 }}
              activeDot={{ r: 8 }}
            />
          )}
          {dataType === 'all' && <Legend />}
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
          formatter={(value: number, name: string) => [
            `${formatNumber(value)} ${getUnit(name as keyof typeof chartColors)}`,
            getLabel(name as keyof typeof chartColors),
          ]}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        />
        {(dataType === 'all' || dataType === 'electricity') && (
          <Bar dataKey="electricity" fill={chartColors.electricity} radius={[4, 4, 0, 0]} />
        )}
        {(dataType === 'all' || dataType === 'gas') && (
          <Bar dataKey="gas" fill={chartColors.gas} radius={[4, 4, 0, 0]} />
        )}
        {(dataType === 'all' || dataType === 'water') && (
          <Bar dataKey="water" fill={chartColors.water} radius={[4, 4, 0, 0]} />
        )}
        {dataType === 'all' && <Legend />}
      </BarChart>
    );
  };

  const getUnit = (type: keyof typeof chartColors) => {
    switch (type) {
      case 'electricity':
        return 'kWh';
      case 'gas':
        return 'm³';
      case 'water':
        return 't';
      default:
        return '';
    }
  };

  const getLabel = (type: keyof typeof chartColors) => {
    switch (type) {
      case 'electricity':
        return '전기사용량';
      case 'gas':
        return '가스사용량';
      case 'water':
        return '수도사용량';
      default:
        return '';
    }
  };

  const getDefaultTitle = () => {
    if (title) return title;
    
    const typeLabel = {
      electricity: '전기',
      gas: '가스',
      water: '수도',
      all: '에너지',
    }[dataType];

    return `${year}년 ${typeLabel} 사용량`;
  };

  return (
    <BaseChart
      title={getDefaultTitle()}
      subtitle={subtitle || (building ? `${building} 건물` : '전체 건물')}
      loading={isLoading}
      error={error?.message}
      className={className}
    >
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>
    </BaseChart>
  );
} 