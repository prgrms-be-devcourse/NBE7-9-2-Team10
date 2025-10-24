'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Notification } from '@/types/notification'
import { NotificationService } from '@/lib/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'
import type { StompSubscription } from '@stomp/stompjs'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated } = useAuth()
  const notificationSubRef = useRef<StompSubscription | null>(null)

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const response = await NotificationService.getNotifications(0, 50)
      
      const mappedNotifications: Notification[] = response.content.map((n: any) => ({
        id: n.id.toString(),
        type: n.type.toLowerCase() as 'like' | 'chat' | 'match',
        message: n.message,
        senderName: n.senderName || undefined,
        senderId: n.senderId || undefined,
        chatroomId: n.chatroomId || undefined,
        isRead: n.isRead,
        timestamp: n.createdAt
      }))

      setNotifications(mappedNotifications)
      
      const count = await NotificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // 알림 읽음 처리
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id)
      
      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  // 알림 삭제
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await NotificationService.deleteNotification(id)
      
      // 로컬 상태 업데이트
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id)
        const updated = prev.filter(n => n.id !== id)
        
        // 읽지 않은 알림이었다면 카운트 감소
        if (notification && !notification.isRead) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1))
        }
        
        return updated
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      await Promise.all(
        unreadNotifications.map(n => NotificationService.markAsRead(n.id))
      )
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [notifications])

  // 모든 알림 삭제
  const deleteAllNotifications = useCallback(async () => {
    try {
      // 백엔드에 모든 알림 삭제 API가 없는 경우를 대비해 개별 삭제로 처리
      if (notifications.length > 0) {
        await Promise.all(
          notifications.map(notification => NotificationService.deleteNotification(notification.id))
        )
      }
      
      // 로컬 상태 초기화
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to delete all notifications:', error)
      // 에러가 발생해도 로컬 상태는 초기화
      setNotifications([])
      setUnreadCount(0)
    }
  }, [notifications])

  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    }
  }, [isAuthenticated, loadNotifications])

  // WebSocket 실시간 알림 구독
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    let mounted = true
    let pollInterval: NodeJS.Timeout | null = null
    let lastNotificationId: string | null = null

    const setupNotificationWebSocket = async () => {
      try {
        const { startWs, monitorConnection } = await import('@/lib/services/wsManager')
        const ws = await startWs()
        
        if (!mounted) return
        
        // WebSocket 연결 상태 변화 모니터링
        const originalOnConnect = ws.client.onConnect
        ws.client.onConnect = (frame) => {
          if (originalOnConnect) originalOnConnect(frame)
        }
        
        const originalOnDisconnect = ws.client.onDisconnect
        ws.client.onDisconnect = (frame) => {
          if (originalOnDisconnect) originalOnDisconnect(frame)
        }
        
        // 연결 모니터링 시작
        monitorConnection()
        
        // 사용자 ID 가져오기
        const userId = localStorage.getItem('userId')
        
        // 백엔드에서 convertAndSendToUser 사용 시 실제 구독 경로
        // Spring의 convertAndSendToUser는 "/user/{userId}/queue/notifications" 형태로 변환됨
        const subscriptionPaths = [
          `/user/${userId}/queue/notifications`,  // convertAndSendToUser의 실제 경로
          '/user/queue/notifications',            // 일반적인 경로
          '/queue/notifications'                  // 백업 경로
        ]
        
        // 여러 경로에 대해 구독 시도
        const subscriptions: StompSubscription[] = []
        
        for (const path of subscriptionPaths) {
          try {
            const subscription = ws.subscribe(path, (msg) => {
              try {
                const notification = JSON.parse(msg.body);

                const newNotification: Notification = {
                  id: notification.id?.toString() || Date.now().toString(),
                  type: notification.type?.toLowerCase() as 'like' | 'chat' | 'match' | 'like_canceled',
                  message: notification.message || '새 알림이 도착했습니다',
                  senderName: notification.senderName,
                  senderId: notification.senderId,
                  chatroomId: notification.chatroomId,
                  profileId: notification.profileId,
                  isRead: false,
                  timestamp: notification.createdAt || new Date().toISOString(),
                };

                setNotifications(prev => {
                  // 중복 알림 방지
                  const exists = prev.some(n => n.id === newNotification.id);
                  if (exists) return prev;

                  const senderId = newNotification.senderId;
                  let filtered = prev;

                  if (newNotification.type === 'like') {
                    // '좋아요' 알림 수신 시, 동일 발신자의 '좋아요 취소' 알림은 제거
                    filtered = prev.filter(n => !(n.type === 'like_canceled' && n.senderId === senderId));
                  } else if (newNotification.type === 'like_canceled') {
                    // '좋아요 취소' 알림 수신 시, 동일 발신자의 '좋아요' 알림을 제거
                    filtered = prev.filter(n => !(n.type === 'like' && n.senderId === senderId));
                  }
                  
                  // 새 알림 추가
                  return [newNotification, ...filtered];
                });

                setUnreadCount(prev => prev + 1);

                // 브라우저 데스크톱 알림
                if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
                  new window.Notification('Unimate', {
                    body: newNotification.message,
                    icon: '/favicon.ico',
                  });
                }
              } catch (e) {
                console.error('[Notification] Parse error:', e);
              }
            });
            subscriptions.push(subscription);
            // 첫 번째 성공한 구독만 유지하고 나머지는 중단
            if (subscriptions.length === 1) {
              break;
            }
          } catch (error) {
            // 구독 실패는 무시하고 다음 경로 시도
          }
        }
        
        // 첫 번째 성공한 구독을 메인으로 설정
        if (subscriptions.length > 0) {
          notificationSubRef.current = subscriptions[0]
        }
        
      } catch (error) {
        if (error instanceof Error && error.message.includes('Access token is required')) {
          return
        }
        
        // WebSocket 실패 시 폴링으로 대체
        
        pollInterval = setInterval(async () => {
          if (!mounted) return
          try {
            const response = await NotificationService.getNotifications(0, 5)
            if (response.content.length > 0) {
              const latestNotification = response.content[0]
              
              // 새로운 알림인지 확인
              if (lastNotificationId && latestNotification.id.toString() === lastNotificationId) {
                return // 같은 알림이면 무시
              }
              
              lastNotificationId = latestNotification.id.toString()
              
              const newNotification: Notification = {
                id: latestNotification.id.toString(),
                type: latestNotification.type.toLowerCase() as 'like' | 'chat' | 'match',
                message: latestNotification.message,
                senderName: latestNotification.senderName,
                senderId: latestNotification.senderId,
                chatroomId: latestNotification.chatroomId,
                profileId: latestNotification.profileId,
                isRead: latestNotification.isRead,
                timestamp: latestNotification.createdAt
              }
              
              setNotifications(prev => {
                const exists = prev.some(n => n.id === newNotification.id)
                if (exists) return prev
                return [newNotification, ...prev]
              })
              
              if (!newNotification.isRead) {
                setUnreadCount(prev => prev + 1)
              }
              
              // 브라우저 데스크톱 알림
              if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
                new window.Notification('Unimate', {
                  body: newNotification.message,
                  icon: '/favicon.ico'
                })
              }
            }
          } catch (e) {
            console.error('[Notification] Polling error:', e)
          }
        }, 2000) // 2초마다 폴링 (더 빠르게)
      }
    }

    setupNotificationWebSocket()

    // 브라우저 알림 권한 요청
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission()
    }

    return () => {
      mounted = false
      notificationSubRef.current?.unsubscribe()
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isAuthenticated])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  // WebSocket 연결 상태 확인 함수
  const checkWebSocketStatus = useCallback(async () => {
    try {
      const { isWsConnected } = await import('@/lib/services/wsManager')
      const isConnected = isWsConnected()
      console.log('🔌 WebSocket 연결 상태:', isConnected ? '연결됨' : '연결 안됨')
      return isConnected
    } catch (error) {
      console.error('🔌 WebSocket 상태 확인 실패:', error)
      return false
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    deleteAllNotifications,
    refreshNotifications,
    addNotification,
    checkWebSocketStatus
  }
}
