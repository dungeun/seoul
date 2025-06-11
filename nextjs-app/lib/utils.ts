import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS 클래스 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 숫자 포맷팅 함수
export function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('ko-KR', options).format(num);
}

// 날짜 포맷팅 함수
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('ko-KR');
}

// 연도/월 배열 생성 함수
export function generateYears(startYear = 2018, endYear = new Date().getFullYear()): number[] {
  const years = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
}

export function generateMonths(): number[] {
  return Array.from({ length: 12 }, (_, i) => i + 1);
}

// 데이터 필터링 함수
export function filterDataByDate<T extends { year: number; month?: number }>(
  data: T[],
  yearFilter?: number | string,
  monthFilter?: number | string
): T[] {
  let filtered = data;
  
  if (yearFilter && yearFilter !== '') {
    filtered = filtered.filter(item => item.year === Number(yearFilter));
  }
  
  if (monthFilter && monthFilter !== '' && 'month' in filtered[0]) {
    filtered = filtered.filter(item => item.month === Number(monthFilter));
  }
  
  return filtered;
}

// URL 쿼리 파라미터 생성
export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// 안전한 JSON 파싱
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// 디바운스 함수
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 로컬 스토리지 헬퍼 (클라이언트 사이드에서만 사용)
export const storage = {
  get: <T = unknown>(key: string, fallback: T | null = null): T | null => {
    if (typeof window === 'undefined') return fallback;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  
  set: (key: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('localStorage set error:', error);
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage remove error:', error);
    }
  },
};

// 환경 변수 헬퍼
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

// 에러 메시지 추출
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return '알 수 없는 오류가 발생했습니다.';
} 