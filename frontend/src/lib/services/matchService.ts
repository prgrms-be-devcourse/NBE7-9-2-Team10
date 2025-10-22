import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { MatchPreference } from '@/types/profile'; // GEMINI: MatchPreference 타입 임포트 경로 수정

// 매칭 관련 API 서비스
export class MatchService {
  /**
   * 룸메이트 추천 목록을 조회합니다.
   */
  static async getRecommendations(filters?: any): Promise<ApiResponse<any>> {
    // TODO: 백엔드 DTO에 맞춰 타입 정의 필요
    return api.get<ApiResponse<any>>(API_ENDPOINTS.MATCH_RECOMMENDATIONS, { params: filters });
  }

  /**
   * 사용자의 매칭 상태를 조회합니다.
   */
  static async getMatchStatus(): Promise<ApiResponse<any>> {
    return api.get<ApiResponse<any>>(API_ENDPOINTS.MATCH_STATUS);
  }

  /**
   * 사용자의 매칭 선호도를 업데이트합니다.
   */
  static async updatePreference(preferenceData: MatchPreference): Promise<ApiResponse<any>> {
    return api.put<ApiResponse<any>>(API_ENDPOINTS.USER_PREFERENCES, preferenceData);
  }

  /**
   * 사용자의 매칭 상태를 비활성화(취소)합니다.
   */
  static async cancelMatching(): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(API_ENDPOINTS.USER_DELETE_MATCHING_STATUS);
  }

  /**
   * 다른 사용자에게 '좋아요'를 보냅니다.
   */
  static async sendLike(receiverId: number): Promise<ApiResponse<any>> {
    return api.post<ApiResponse<any>>(API_ENDPOINTS.MATCH_LIKES, { receiverId });
  }

  /**
   * 보냈던 '좋아요'를 취소합니다.
   */
  static async cancelLike(receiverId: number): Promise<ApiResponse<void>> {
    return api.delete<ApiResponse<void>>(`${API_ENDPOINTS.MATCHES}/${receiverId}`);
  }
}
