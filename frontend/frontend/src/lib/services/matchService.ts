import api from './api'

// Match 관련 타입 정의
export interface MatchRecommendationDetailResponse {
  receiverId: number
  name: string
  university: string
  studentVerified: boolean
  mbti: string
  gender: 'MALE' | 'FEMALE'
  age: number
  isSmoker: boolean
  isPetAllowed: boolean
  isSnoring: boolean
  sleepTime: number
  cleaningFrequency: number
  hygieneLevel: number
  noiseSensitivity: number
  drinkingFrequency: number
  guestFrequency: number
  preferredAgeGap: number
  birthDate: string
  startUseDate: string
  endUseDate: string
  preferenceScore: number
  matchType: 'LIKE' | 'REQUEST' | null
  matchStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
}

export class MatchService {
  // 후보 프로필 상세 조회
  static async getMatchRecommendationDetail(receiverId: number): Promise<MatchRecommendationDetailResponse> {
    const response = await api.get(`/matches/candidates/${receiverId}`)
    return response.data
  }

  // 좋아요 보내기
  static async sendLike(receiverId: number): Promise<{ matchId: number; isMatched: boolean }> {
    const response = await api.post('/matches/likes', { receiverId })
    return response.data
  }

  // 좋아요 취소
  static async cancelLike(receiverId: number): Promise<void> {
    await api.delete(`/matches/${receiverId}`)
  }
}


