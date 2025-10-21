// API 공통 타입 정의

// API 응답 기본 구조
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  status: number;
  success: boolean;
}

// API 에러 응답
export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: '/api/v1/auth/login',
  SIGNUP: '/api/v1/auth/signup',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/token/refresh',
  ME: '/api/v1/auth/me',
  
  // 이메일 인증 관련
  EMAIL_REQUEST: '/api/v1/email/request',
  EMAIL_VERIFY: '/api/v1/email/verify',
  
  // 프로필 관련
  PROFILE: '/api/v1/profile',
  PROFILE_CREATE: '/api/v1/profile',
  PROFILE_GET: '/api/v1/profile',
  PROFILE_UPDATE: '/api/v1/profile',
  
  // 사용자 관련
  USER: '/api/v1/user',
  USER_PREFERENCES: '/api/v1/users/me/preferences',
  USER_DELETE_MATCHING_STATUS: "/api/v1/users/me/matching-status",

  // 매칭 관련
  MATCHES: '/api/v1/matches',
  MATCH_STATUS: '/api/v1/matches/status',
  MATCH_RECOMMENDATIONS: '/api/v1/matches/recommendations',
  MATCH_LIKES: '/api/v1/matches/likes',

  // 관리자 관련
  ADMIN_REPORTS: '/api/v1/admin/reports',
  ADMIN_REPORT_DETAIL: '/api/v1/admin/reports', // 상세 조회를 위해 /:id가 추가되어야 함
} as const;

// API 기본 설정
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  TIMEOUT: 10000, // 10초
  RETRY_ATTEMPTS: 3,
} as const;

// 로딩 상태 타입
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 폼 상태 타입
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
}
