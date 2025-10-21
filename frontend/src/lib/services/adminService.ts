import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { ReportListResponse, ReportDetail } from '@/types/admin';

// 관리자 관련 API 서비스
export class AdminService {
  /**
   * 관리자용 신고 목록을 조회합니다.
   */
  static async getReports(
    page: number,
    size: number,
    status?: string | null,
    keyword?: string | null
  ): Promise<ApiResponse<ReportListResponse>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    if (status) params.append('status', status);
    if (keyword) params.append('keyword', keyword);

    const endpoint = `${API_ENDPOINTS.ADMIN_REPORTS}?${params.toString()}`;
    return api.get<ApiResponse<ReportListResponse>>(endpoint);
  }

  /**
   * 관리자용 신고 상세 정보를 조회합니다.
   */
  static async getReportDetail(reportId: number): Promise<ApiResponse<ReportDetail>> {
    const endpoint = `${API_ENDPOINTS.ADMIN_REPORT_DETAIL}/${reportId}`;
    return api.get<ApiResponse<ReportDetail>>(endpoint);
  }
}
