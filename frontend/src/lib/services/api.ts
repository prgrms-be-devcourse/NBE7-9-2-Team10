import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, API_ENDPOINTS, ApiResponse, ApiError } from '@/types/api';

// Axios 인스턴스 생성
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터 - JWT 토큰 자동 추가
  instance.interceptors.request.use(
    (config) => {
      // 클라이언트 사이드에서만 토큰 처리
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터 - 에러 처리 및 토큰 갱신
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      // 401 에러 처리 (토큰 만료)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // 토큰 갱신 로직 (필요시 구현)
        // const refreshToken = localStorage.getItem('refreshToken');
        // if (refreshToken) {
        //   try {
        //     const response = await instance.post('/auth/refresh', { refreshToken });
        //     localStorage.setItem('accessToken', response.data.accessToken);
        //     return instance(originalRequest);
        //   } catch (refreshError) {
        //     // 리프레시 실패 시 로그인 페이지로 리다이렉트
        //     localStorage.removeItem('accessToken');
        //     window.location.href = '/login';
        //   }
        // }

        // 현재는 토큰 제거 후 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
        }
      }

      // 에러 응답 변환
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

// API 인스턴스 생성
export const apiClient = createApiInstance();

// API 응답 래퍼 함수
export const apiRequest = async <T>(
  requestConfig: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response = await apiClient.request<ApiResponse<T>>(requestConfig);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

// HTTP 메서드별 헬퍼 함수들
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),
  
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),
  
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
  
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),
};

// API 엔드포인트 상수들 export
export { API_ENDPOINTS, API_CONFIG };

export default apiClient;
