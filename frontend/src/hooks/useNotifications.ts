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

    const setupNotificationWebSocket = async () => {
      try {
        const { startWs } = await import('@/lib/services/wsManager')
        const ws = await startWs()
        
        if (!mounted) return

        notificationSubRef.current = ws.subscribe('/user/queue/notifications', (msg) => {
          try {
            const notification = JSON.parse(msg.body)
            
            const newNotification: Notification = {
              id: notification.id?.toString() || Date.now().toString(),
              type: notification.type?.toLowerCase() as 'like' | 'chat' | 'match',
              message: notification.message || '새 알림이 도착했습니다',
              senderName: notification.senderName,
              senderId: notification.senderId,
              chatroomId: notification.chatroomId,
              profileId: notification.profileId,
              isRead: false,
              timestamp: notification.createdAt || new Date().toISOString()
            }
            
            setNotifications(prev => [newNotification, ...prev])
            setUnreadCount(prev => prev + 1)
            
            // 브라우저 데스크톱 알림
            if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'granted') {
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

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
    addNotification
  }
}
