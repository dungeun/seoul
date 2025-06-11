// 에너지 데이터 타입
export interface EnergyData {
  id: number;
  building_name: string;
  year: number;
  month: number;
  electricity: number;
  gas: number;
  water: number;
  created_at: string;
}

// 태양광 데이터 타입
export interface SolarData {
  id: number;
  building_name: string;
  year: number;
  month: number;
  generation: number;
  capacity: number;
  created_at: string;
}

// 건물 정보 타입
export interface Building {
  id: number;
  name: string;
  code?: string;
  type?: string;
  area?: number;
  created_at: string;
}

// 차트 데이터 타입
export interface ChartDataPoint {
  month: string;
  value: number;
  [key: string]: string | number;
}

// 온실가스 배출량 데이터 타입
export interface GreenhouseGasData {
  month: string;
  emission: number;
}

// 대시보드 통계 타입
export interface DashboardStats {
  posts: number;
  files: number;
  categories: number;
  views: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 필터 타입
export interface DataFilter {
  year?: number | string;
  month?: number | string;
  building?: string;
}

// 실시간 데이터 타입
export interface RealTimeData {
  type: 'energy' | 'solar' | 'greenhouse';
  building_name: string;
  timestamp: string;
  value: number;
  unit: string;
} 