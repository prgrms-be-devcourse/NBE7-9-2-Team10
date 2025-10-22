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
        // ==================================================================
        // <<< 임시 관리자 권한 상승 코드 시작 >>>
        // 나중에 관리자 로그인 UI가 구현되면 이 블록을 주석 처리하거나 삭제하세요.
        const adminOverrideToken = localStorage.getItem('admin_override_token');
        // 관리자 API 경로에만 임시 토큰을 적용합니다.
        if (adminOverrideToken && config.url?.includes('/api/v1/admin/')) {
          config.headers.Authorization = `Bearer ${adminOverrideToken}`;
          return config;
        }
        // <<< 임시 관리자 권한 상승 코드 종료 >>>
        // ==================================================================

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

      // 현재 페이지가 로그인 페이지라면 리다이렉트하지 않음
      if (typeof window !== 'undefined' && window.location.pathname.includes('/login')) {
        return Promise.reject(error);
      }

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

// API 응답 래퍼 함수 - 수정됨
export const apiRequest = async <T>(
  requestConfig: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient.request<T>(requestConfig);
    // response.data를 직접 반환 (이미 T 타입)
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
