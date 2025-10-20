import { api, API_ENDPOINTS } from '@/lib/services/api';
import { ProfileCreateRequest, ProfileResponse } from '@/types/profile';

// 프로필 서비스 클래스
export class ProfileService {
  /**
   * 프로필 생성
   */
  static async createProfile(data: ProfileCreateRequest): Promise<ProfileResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.PROFILE_CREATE,
      data
    );
    const result = response.data || response;
    return result as ProfileResponse;
  }

  /**
   * 내 프로필 조회
   */
  static async getMyProfile(): Promise<ProfileResponse> {
    const response = await api.get<any>(
      API_ENDPOINTS.PROFILE_GET
    );
    const result = response.data || response;
    return result as ProfileResponse;
  }

  /**
   * 프로필 수정
   */
  static async updateProfile(data: ProfileCreateRequest): Promise<ProfileResponse> {
    const response = await api.put<any>(
      API_ENDPOINTS.PROFILE_UPDATE,
      data
    );
    const result = response.data || response;
    return result as ProfileResponse;
  }

  /**
   * 매칭 상태 업데이트
   */
  static async updateMatchingStatus(enabled: boolean): Promise<ProfileResponse> {
    const response = await api.patch<any>(
      API_ENDPOINTS.PROFILE,
      { matchingEnabled: enabled }
    );
    const result = response.data || response;
    return result as ProfileResponse;
  }

  /**
   * 프로필 존재 여부 확인
   */
  static async checkProfileExists(): Promise<boolean> {
    try {
      await this.getMyProfile();
      return true;
    } catch (error: unknown) {
      if ((error as { status?: number }).status === 404) {
        return false;
      }
      throw error;
    }
  }
}

// 기본 export
export default ProfileService;
