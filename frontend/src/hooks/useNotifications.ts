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
  const [activeChatroomId, setActiveChatroomId] = useState<number | null>(null)
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

  // 특정 채팅방의 모든 알림을 읽음 처리
  const markChatroomNotificationsAsRead = useCallback(async (chatroomId: number) => {
    try {
      const chatroomNotifications = notifications.filter(n => 
        n.chatroomId === chatroomId && !n.isRead
      )
      
      
      if (chatroomNotifications.length === 0) return
      
      await Promise.all(
        chatroomNotifications.map(n => NotificationService.markAsRead(n.id))
      )
      
      setNotifications(prev =>
        prev.map(n => 
          n.chatroomId === chatroomId ? { ...n, isRead: true } : n
        )
      )
      
          setUnreadCount(prev => Math.max(0, prev - chatroomNotifications.length))
    } catch (error) {
      console.error('Failed to mark chatroom notifications as read:', error)
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
    let reconnectAttempts = 0
    const maxReconnectAttempts = 3

    const setupNotificationWebSocket = async () => {
      try {
        // 기존 연결이 있다면 정리
        if (notificationSubRef.current) {
          notificationSubRef.current.unsubscribe()
          notificationSubRef.current = null
        }
        
        const { startWs } = await import('@/lib/services/wsManager')
        const ws = await startWs()
        
        if (!mounted) return

        // 현재 사용자 ID를 가져와서 동적으로 구독 경로 생성
        const currentUserId = localStorage.getItem('userId')
        const subscriptionPath = `/user/${currentUserId}/queue/notifications`
        
        notificationSubRef.current = ws.subscribe(subscriptionPath, (msg) => {
          try {
            const notification = JSON.parse(msg.body)
            
            // 현재 활성 채팅방의 채팅 알림인지 확인
            const isInChatroom = window.location.pathname.includes('/chat/')
            const currentChatroomId = window.location.pathname.match(/\/chat\/(\d+)/)?.[1]
            const isCurrentChatroomNotification = 
              notification.type?.toLowerCase() === 'chat' && 
              notification.chatroomId?.toString() === currentChatroomId
            
            const isActiveChatroomNotification = isInChatroom && isCurrentChatroomNotification
            
            
            const newNotification: Notification = {
              id: notification.id?.toString() || Date.now().toString(),
              type: notification.type?.toLowerCase() as 'like' | 'chat' | 'match',
              message: notification.message || '새 알림이 도착했습니다',
              senderName: notification.senderName,
              senderId: notification.senderId,
              chatroomId: notification.chatroomId,
              profileId: notification.profileId,
              isRead: isActiveChatroomNotification, // 활성 채팅방의 알림은 자동으로 읽음 처리
              timestamp: notification.createdAt || new Date().toISOString()
            }
            
            setNotifications(prev => [newNotification, ...prev])
            
          // 활성 채팅방의 알림이 아닌 경우에만 unreadCount 증가
          if (!isActiveChatroomNotification) {
            setUnreadCount(prev => prev + 1)
            
            // 서버에서 최신 unread count를 가져와서 동기화
            setTimeout(async () => {
              try {
                const count = await NotificationService.getUnreadCount()
                setUnreadCount(count)
              } catch (error) {
                console.error('[Notification] Failed to sync unread count:', error)
              }
            }, 100)
          }
            
            // 활성 채팅방의 알림이 아닌 경우에만 브라우저 데스크톱 알림 표시
            if (!isActiveChatroomNotification && 
                typeof window !== 'undefined' && 
                'Notification' in window && 
                window.Notification && 
                window.Notification.permission === 'granted') {
              new window.Notification('Unimate', {
                body: newNotification.message,
                icon: '/favicon.ico'
              })
            }
          } catch (e) {
            console.error('[Notification] Parse error:', e)
          }
        })
      } catch (error) {
        console.error('[Notification] WebSocket setup failed:', error)
        console.error('[Notification] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        if (error instanceof Error && error.message.includes('Access token is required')) {
          return
        }
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

  // 활성 채팅방 설정
  const setActiveChatroom = useCallback((chatroomId: number | null) => {
    setActiveChatroomId(chatroomId)
    
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    markChatroomNotificationsAsRead,
    refreshNotifications,
    addNotification,
    setActiveChatroom,
    activeChatroomId,
  }
}
