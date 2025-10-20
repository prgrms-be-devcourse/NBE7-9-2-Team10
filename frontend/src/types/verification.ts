// 이메일 인증 관련 타입 정의

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailCodeVerifyRequest {
  email: string;
  code: string;
}

export interface MessageResponse {
  message: string;
}

export interface VerificationStep {
  step: 'email' | 'code' | 'complete';
  email?: string;
}
