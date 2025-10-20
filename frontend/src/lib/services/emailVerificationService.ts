import { api, API_ENDPOINTS } from '@/lib/services/api';
import { EmailVerificationRequest, EmailCodeVerifyRequest, MessageResponse } from '@/types/verification';

// 이메일 인증 서비스 클래스
export class EmailVerificationService {
  /**
   * 이메일 인증 코드 요청
   */
  static async requestVerificationCode(email: string): Promise<MessageResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.EMAIL_REQUEST,
      { email } as EmailVerificationRequest
    );
    
    const result = response.data || response;
    return result as MessageResponse;
  }

  /**
   * 이메일 인증 코드 검증
   */
  static async verifyCode(email: string, code: string): Promise<MessageResponse> {
    const response = await api.post<any>(
      API_ENDPOINTS.EMAIL_VERIFY,
      { email, code } as EmailCodeVerifyRequest
    );
    
    const result = response.data || response;
    return result as MessageResponse;
  }
}

// 기본 export
export default EmailVerificationService;
