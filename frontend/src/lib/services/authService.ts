import { api, API_ENDPOINTS } from '@/lib/services/api';
import { LoginRequest, LoginResponse, SignupRequest, SignupResponse, User } from '@/types/user';
import { ApiResponse } from '@/types/api';

// 인증 서비스 클래스
export class AuthService {
  /**
   * 로그인
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    // 응답에서 실제 데이터 추출
    const rawData = response.data?.data || response.data || response;
    const loginData = rawData as LoginResponse;
    
    // 토큰을 localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('userId', loginData.userId.toString());
      localStorage.setItem('userEmail', loginData.email);
      
      // JWT 토큰 만료 시간 추정 (1시간)
      const expirationTime = Date.now() + (60 * 60 * 1000);
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }
    
    return loginData as LoginResponse;
  }

  /**
   * 회원가입
   */
  static async signup(userData: SignupRequest): Promise<SignupResponse> {
    const response = await api.post<ApiResponse<SignupResponse>>(
      API_ENDPOINTS.SIGNUP,
      userData
    );
    
    const rawData = response.data?.data || response.data || response;
    return rawData;
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // 서버 로그아웃 실패해도 클라이언트 토큰은 제거
      console.warn('Server logout failed:', error);
    } finally {
      // 클라이언트 토큰 및 사용자 정보 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
      }
    }
  }

  /**
   * 현재 사용자 정보 조회 (기본 정보만)
   */
  static async getCurrentUser(): Promise<{ userId: number; email: string }> {
    const response = await api.get<ApiResponse<{ userId: number; email: string }>>(API_ENDPOINTS.ME);
    const rawData = response.data?.data || response.data || response;
    return rawData as { userId: number; email: string };
  }

  /**
   * 완전한 사용자 정보 가져오기
   */
  static async getFullUserInfo(): Promise<User> {
    const response = await api.get<ApiResponse<User>>(API_ENDPOINTS.USER);
    const rawData = response.data?.data || response.data || response;
    return rawData as User;
  }


  /**
   * 토큰 유효성 확인
   */
  static isTokenValid(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('accessToken');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token) return false;
    
    // 만료 시간 확인
    if (expiration && Date.now() > parseInt(expiration)) {
      this.clearTokens();
      return false;
    }
    
    return true;
  }

  /**
   * 토큰 가져오기
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * 토큰들 제거
   */
  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('refreshToken');
  }

  /**
   * 로그인 상태 확인
   */
  static isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  /**
   * 인증이 필요한 경우 로그인 페이지로 리다이렉트
   */
  static redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// 기본 export
export default AuthService;