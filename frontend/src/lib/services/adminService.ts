import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { Report, ReportDetail, ReportListResponse } from '@/types/admin';

// 관리자 관련 API 서비스
export class AdminService {
  /**
   * 신고 목록을 조회합니다.
   * @param params - 필터링 및 페이지네이션 파라미터
   */
  static async getReports(params?: any): Promise<ApiResponse<ReportListResponse>> {
    return api.get<ApiResponse<ReportListResponse>>(API_ENDPOINTS.ADMIN_REPORTS, { params });
  }

  /**
   * 특정 신고의 상세 정보를 조회합니다.
   * @param reportId - 조회할 신고의 ID
   */
  static async getReportDetail(reportId: number): Promise<ApiResponse<ReportDetail>> {
    const url = `${API_ENDPOINTS.ADMIN_REPORT_DETAIL}/${reportId}`;
    return api.get<ApiResponse<ReportDetail>>(url);
  }
}