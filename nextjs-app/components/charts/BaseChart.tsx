'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
  actions?: ReactNode;
}

export default function BaseChart({
  title,
  subtitle,
  children,
  className,
  loading,
  error,
  actions,
}: BaseChartProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl',
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* 컨텐츠 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-gray-600">데이터 로딩 중...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-red-600">
            <div className="text-center">
              <div className="text-lg font-medium">데이터 로딩 오류</div>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="min-h-[300px]">{children}</div>
        )}
      </div>
    </div>
  );
} 