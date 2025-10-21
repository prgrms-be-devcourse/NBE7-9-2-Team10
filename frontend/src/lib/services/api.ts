// src/lib/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS, ApiResponse, ApiError } from '@/types/api';

/**
 * Axios 인스턴스 (쿠키 기반)
 * - 모든 요청에 쿠키 자동 포함 (withCredentials)
 * - Authorization 헤더 사용하지 않음
 */
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // ✅ 쿠키 포함 요청 허용
  });

  // 요청 인터셉터: JWT 토큰을 Authorization 헤더에 추가
  instance.interceptors.request.use(
    (config) => {
      // localStorage에서 토큰 가져오기
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터: 공통 에러 처리
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 401: 세션 만료/미인증 → 로그인 페이지로 이동
      if (error.response?.status === 401 && !originalRequest?._retry) {
        originalRequest._retry = true;

        // (선택) 나중에 리프레시 토큰 엔드포인트가 준비되면 여기서 호출
        // try {
        //   await instance.post(API_ENDPOINTS.REFRESH);
        //   return instance(originalRequest);
        // } catch (_) {
        //   // Refresh 실패 시 로그인 이동
        // }

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // 에러 응답 표준화
      const apiError: ApiError = {
        message: (error.response?.data as { message?: string })?.message || error.message || 'Unknown error',
        status: error.response?.status || 500,
        timestamp: new Date().toISOString(),
        path: error.config?.url,
      };

      return Promise.reject(apiError);
    }
  );

  return instance;
};

// 인스턴스
export const apiClient = createApiInstance();

// 공통 요청 래퍼
export const apiRequest = async <T>(requestConfig: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>(requestConfig);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// HTTP 메서드별 헬퍼 함수들
export const api = {
  get:  <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put:  <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  delete:<T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),

  patch:<T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
};

// API 엔드포인트 상수들 export
export { API_ENDPOINTS, API_CONFIG };
export default apiClient;
