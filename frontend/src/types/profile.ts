// UserProfile 관련 타입 정의 (백엔드와 매칭)

// 프로필 생성/수정 요청 타입 (ProfileCreateRequest.java와 매칭)
export interface ProfileCreateRequest {
  sleepTime?: number;              // 수면 시간 (0-23)
  isPetAllowed?: boolean;          // 반려동물 허용 여부
  isSmoker?: boolean;              // 흡연 여부
  cleaningFrequency?: number;      // 청소 빈도 (1-5 스케일)
  preferredAgeGap?: number;        // 선호 연령대 차이
  hygieneLevel?: number;           // 위생 수준 (1-5 스케일)
  isSnoring?: boolean;             // 코골이 여부
  drinkingFrequency?: number;      // 음주 빈도 (1-5 스케일)
  noiseSensitivity?: number;       // 소음 민감도 (1-5 스케일)
  guestFrequency?: number;         // 손님 초대 빈도 (1-5 스케일)
  mbti?: string;                   // MBTI 성격 유형
  startUseDate?: string;           // 사용 시작일 (ISO date string)
  endUseDate?: string;             // 사용 종료일 (ISO date string)
  matchingEnabled?: boolean;       // 매칭 활성화 여부
}

// 프로필 응답 타입 (ProfileResponse.java와 매칭)
export interface ProfileResponse {
  id: number;
  sleepTime?: number;
  isPetAllowed?: boolean;
  isSmoker?: boolean;
  cleaningFrequency?: number;
  preferredAgeGap?: number;
  hygieneLevel?: number;
  isSnoring?: boolean;
  drinkingFrequency?: number;
  noiseSensitivity?: number;
  guestFrequency?: number;
  mbti?: string;
  startUseDate?: string;
  endUseDate?: string;
  matchingEnabled?: boolean;
  createdAt: string;               // LocalDateTime은 ISO string으로 변환
  updatedAt: string;
}

// 프로필 상태 타입
export interface ProfileState {
  profile: ProfileResponse | null;
  isLoading: boolean;
  error: string | null;
}

// 매칭 관련 타입
export interface MatchingStatus {
  enabled: boolean;
  lastUpdated: string;
}

// 매칭 선호도 등록/수정 타입
export interface MatchPreference {
  startUseDate: string;
  endUseDate: string;
  sleepTime: number;
  isPetAllowed: boolean;
  isSmoker: boolean;
  cleaningFrequency: number;
  preferredAgeGap: number;
  hygieneLevel: number;
  isSnoring: boolean;
  drinkingFrequency: number;
  noiseSensitivity: number;
  guestFrequency: number;
}
