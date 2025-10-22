// Gender enum (백엔드 Gender.java와 매칭)
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

// User 엔티티 타입 (백엔드 User.java와 매칭)
export interface User {
  userId?: number;
  email: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  university: string;
}

// 인증 관련 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  accessToken: string;
}

// 회원가입 관련 타입 (백엔드 형식에 맞춤)
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  gender: Gender;
  birthDate: string; // ISO string
  university: string;
}

export interface SignupResponse {
  userId: number;
  email: string;
  name: string;
}

export interface CustomUserPrincipal {
  email: string;
  userId: number;
  // JWT에서 추출되는 사용자 정보
}
