import { apiClient } from './api'
import { Notification } from '@/types/notification'

export interface NotificationResponse {
  content: Notification[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}

export class NotificationService {
  // 알림 목록 조회
  static async getNotifications(page: number = 0, size: number = 20): Promise<NotificationResponse> {
    const response = await apiClient.get('/api/v1/notifications', {
      params: { page, size }
    })
    return response.data
  }

  // 읽지 않은 알림 개수 조회
  static async getUnreadCount(): Promise<number> {
    const response = await apiClient.get('/api/v1/notifications/unread-count')
    return response.data
  }

  // 알림 읽음 처리
  static async markAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/api/v1/notifications/${notificationId}/read`)
  }

  // 알림 삭제
  static async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${notificationId}`)
  }

  // 모든 알림 삭제
  static async deleteAllNotifications(): Promise<void> {
    await apiClient.delete('/api/v1/notifications/all')
  }

  // 테스트 알림 전송 (개발용) - 실제로는 알림 새로고침
  static async sendTestNotification(): Promise<void> {
    // 백엔드에 테스트 엔드포인트가 없으므로 알림 목록을 새로고침
    await apiClient.get('/api/v1/notifications', {
      params: { page: 0, size: 1 }
    })
  }
}


