import { z } from 'zod';

// 프로필 생성/수정 유효성 검증 스키마
export const profileCreateSchema = z.object({
  sleepTime: z.number().min(0).max(23).optional(),
  isPetAllowed: z.boolean().optional(),
  isSmoker: z.boolean().optional(),
  cleaningFrequency: z.number().min(1).max(5).optional(),
  preferredAgeGap: z.number().min(0).max(20).optional(),
  hygieneLevel: z.number().min(1).max(5).optional(),
  isSnoring: z.boolean().optional(),
  drinkingFrequency: z.number().min(1).max(5).optional(),
  noiseSensitivity: z.number().min(1).max(5).optional(),
  guestFrequency: z.number().min(1).max(5).optional(),
  mbti: z.string().regex(/^[EI][SN][TF][JP]$/, '올바른 MBTI 형식이 아닙니다').optional(),
  startUseDate: z.string().optional(),
  endUseDate: z.string().optional(),
  matchingEnabled: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.startUseDate && data.endUseDate) {
      return new Date(data.startUseDate) <= new Date(data.endUseDate);
    }
    return true;
  },
  {
    message: '사용 종료일은 시작일보다 늦어야 합니다',
    path: ['endUseDate'],
  }
);

// 로그인 유효성 검증 스키마
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

// 에러 메시지 변환 함수
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
  }
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { data: { message: string } } }).response;
    return response?.data?.message || '알 수 없는 오류가 발생했습니다';
  }
  return '알 수 없는 오류가 발생했습니다';
};

// 폼 에러 추출 함수
export const extractFormErrors = (error: unknown): Record<string, string> => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response: { data: { errors?: Record<string, string> } } }).response;
    return response?.data?.errors || {};
  }
  return {};
};
