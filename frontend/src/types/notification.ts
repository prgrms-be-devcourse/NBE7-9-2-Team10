export interface Notification {
  id: string
  type: 'like' | 'chat' | 'match'
  message: string
  timestamp: Date
  isRead: boolean
  senderName?: string
  senderId?: number
  chatroomId?: number
  profileId?: number
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

