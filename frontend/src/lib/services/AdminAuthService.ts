import { api } from '@/lib/services/api';
import { API_ENDPOINTS } from '@/types/api';
import {
  AdminSignupRequest,
  AdminSignupResponse,
  AdminLoginRequest,
  AdminLoginResponse
} from '@/types/admin';

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

  /**
   * 관리자 로그인
   */
  static async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    // ✅ 관리자 로그인 전에 일반 사용자 토큰 제거
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('tokenExpiration');
    }

    const response = await api.post<AdminLoginResponse>(
      API_ENDPOINTS.ADMIN_LOGIN,
      credentials
    );

    // 관리자 토큰을 별도로 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminAccessToken', response.accessToken);
      localStorage.setItem('adminId', response.adminId.toString());
      localStorage.setItem('adminEmail', response.email);

      // 관리자 로그인 상태 플래그
      localStorage.setItem('isAdmin', 'true');
    }

    return response;
  }

  /**
   * 관리자 로그아웃
   */
  static async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.ADMIN_LOGOUT);
    } catch (error) {
      console.warn('Admin logout failed:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminName');
        localStorage.removeItem('isAdmin');
      }
    }
  }

  /**
   * 관리자 인증 상태 확인
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('adminAccessToken');
    const isAdmin = localStorage.getItem('isAdmin');

    return !!(token && isAdmin === 'true');
  }

  /**
   * 관리자 토큰 제거
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    localStorage.removeItem('isAdmin');
  }
}

export default AdminAuthService;