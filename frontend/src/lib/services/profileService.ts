import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ApiResponse } from '@/types/api';
import { Profile, ProfileCreateRequest } from '@/types/profile';

// 프로필 관련 API 서비스
export class ProfileService {
  /**
   * 현재 로그인된 사용자의 프로필 정보를 조회합니다.
   */
  static async getMyProfile(): Promise<Profile> {
    return api.get<Profile>(API_ENDPOINTS.PROFILE_GET);
  }

  /**
   * 사용자의 프로필을 생성합니다.
   */
  static async createProfile(profileData: ProfileCreateRequest): Promise<ApiResponse<Profile>> {
    return api.post<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_CREATE, profileData);
  }

  /**
   * 사용자의 프로필을 업데이트합니다.
   */
  static async updateProfile(profileData: ProfileCreateRequest): Promise<ApiResponse<Profile>> {
    return api.put<ApiResponse<Profile>>(API_ENDPOINTS.PROFILE_UPDATE, profileData);
  }
}