import { api, API_ENDPOINTS } from '@/lib/services/api';
import { SignupRequest, SignupResponse } from '@/types/user';
import { MessageResponse } from '@/types/verification';

export class RegisterService {
  /** 이메일 인증번호 요청 */
  static async requestVerification(email: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>(API_ENDPOINTS.EMAIL_REQUEST, { email });
    return res.data;
  }

  /** 이메일 인증번호 검증 */
  static async verifyEmailCode(email: string, code: string): Promise<MessageResponse> {
    const res = await api.post<MessageResponse>(API_ENDPOINTS.EMAIL_VERIFY, { email, code });
    return res.data;
  }

  /** 회원가입 */
  static async signup(data: SignupRequest): Promise<SignupResponse> {
    const res = await api.post<SignupResponse>(API_ENDPOINTS.SIGNUP, data);
    return res.data;
  }
}
