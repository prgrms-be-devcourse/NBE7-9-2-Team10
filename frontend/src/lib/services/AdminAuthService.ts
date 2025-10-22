import { api } from '@/lib/services/api';
import { API_ENDPOINTS } from '@/types/api';
import { AdminSignupRequest, AdminSignupResponse } from '@/types/admin';

export class AdminAuthService {
  /**
   * 관리자 회원가입
   */
  static async signup(data: AdminSignupRequest): Promise<AdminSignupResponse> {
    const response = await api.post<AdminSignupResponse>(
      API_ENDPOINTS.ADMIN_SIGNUP,
      data
    );
    return response;
  }
}

export default AdminAuthService;