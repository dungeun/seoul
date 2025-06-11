import axios from 'axios';
import { ApiResponse } from '@/types';

// Axios 기본 설정
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      // 인증 에러 처리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// 공통 API 함수들
export const apiClient = {
  get: <T>(url: string, config = {}) =>
    api.get<ApiResponse<T>>(url, config),

  post: <T>(url: string, data = {}, config = {}) =>
    api.post<ApiResponse<T>>(url, data, config),

  put: <T>(url: string, data = {}, config = {}) =>
    api.put<ApiResponse<T>>(url, data, config),

  delete: <T>(url: string, config = {}) =>
    api.delete<ApiResponse<T>>(url, config),
};

export default api; 