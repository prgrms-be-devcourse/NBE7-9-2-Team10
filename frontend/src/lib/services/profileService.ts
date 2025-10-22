import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { Profile } from '@/types/profile';

// 프로필 관련 API 서비스
export class ProfileService {
  /**
   * 현재 로그인된 사용자의 프로필 정보를 조회합니다.
   */
  static async getMyProfile(): Promise<ApiResponse<Profile>> {
    return api.get<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_GET);
  }
}