import api from './api'
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
    const response = await api.get('/notifications', {
      params: { page, size }
    })
    return response.data
  }

  // 읽지 않은 알림 개수 조회
  static async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count')
    return response.data
  }

  // 알림 읽음 처리
  static async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`)
  }

  // 알림 삭제
  static async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`)
  }
}


