import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { Report, ReportDetail, ReportListResponse } from '@/types/admin';

export type ActionType = 'REJECT' | 'DEACTIVATE';

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
    const url = `${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}`;
    return api.get<ApiResponse<ReportDetail>>(url);
  }

  /**
   * 특정 신고에 대한 조치를 처리합니다.
   * @param reportId - 처리할 신고의 ID
   * @param action - 처리할 조치 유형
   */
  static async handleReportAction(reportId: number, action: ActionType): Promise<ApiResponse<any>> {
    const url = `${API_ENDPOINTS.ADMIN_REPORTS}/${reportId}/action`;
    return api.patch<ApiResponse<any>>(url, { action });
  }
}