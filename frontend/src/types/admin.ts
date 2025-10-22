/**
 * 신고 목록 API 응답의 각 항목(신고 요약 정보)에 대한 타입
 */
export interface ReportSummary {
  reportId: number;
  reporterName: string;
  reportedName: string;
  category: string;
  status: 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

/**
 * 신고 목록 조회 API의 전체 응답에 대한 타입
 */
export interface ReportListResponse {
  content: ReportSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * 신고 상세 정보 내 사용자 정보 타입
 */
export interface ReportUserInfo {
  userId: number;
  name: string;
  email: string;
  university: string;
}

/**
 * 신고 상세 정보 API 응답에 대한 타입
 */
export interface ReportDetail {
  reportId: number;
  reporterInfo: ReportUserInfo;
  reportedInfo: ReportUserInfo;
  category: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  adminId: number;
  email: string;
  name?: string;
}

export interface AdminSignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface AdminSignupResponse {
  adminId: number;
  email: string;
  name: string;
}
