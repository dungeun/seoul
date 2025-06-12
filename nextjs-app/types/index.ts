export interface EnergyData {
  id: number;
  building_id: number;
  building_name?: string;
  year: number;
  month: number;
  electricity_usage: number;
  gas_usage: number;
  district_heating_usage: number;
  district_cooling_usage: number;
  water_usage: number;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  area: number;
  floors: number;
  created_at: string;
  updated_at: string;
}

export interface SolarData {
  id: number;
  year: number;
  month: number;
  generation_kwh: number;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  thumbnail_url?: string;
  board_id: number;
  category_id?: number;
  status: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: number;
  name: string;
  url: string;
  target: string;
  parent_id?: number;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}