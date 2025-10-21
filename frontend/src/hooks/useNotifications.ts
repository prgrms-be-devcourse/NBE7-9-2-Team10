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

  // 백엔드에서 알림 목록 조회
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const response = await NotificationService.getNotifications(0, 50)
      
      // 백엔드 응답을 프론트엔드 Notification 타입으로 변환
      const mappedNotifications: Notification[] = response.content.map((n: any) => ({
        id: n.id.toString(),
        type: n.type.toLowerCase() as 'like' | 'chat' | 'match',
        message: n.message,
        senderName: n.senderName || undefined,
        senderId: n.senderId || undefined,
        chatroomId: n.chatroomId || undefined,
        isRead: n.isRead,
        timestamp: n.createdAt // ISO string
      }))

      setNotifications(mappedNotifications)
      
      // 디버깅을 위해 localStorage에도 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('notifications', JSON.stringify(mappedNotifications))
        console.log('[useNotifications] 알림 데이터를 localStorage에 저장:', mappedNotifications)
      }
      
      // 읽지 않은 알림 개수도 조회
      const count = await NotificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      // 에러 발생 시 빈 배열로 설정
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

  // 모든 알림 읽음 처리 (백엔드에 API가 없으면 개별 호출)
  const markAllAsRead = useCallback(async () => {
    try {
      // 읽지 않은 알림들만 필터링
      const unreadNotifications = notifications.filter(n => !n.isRead)
      
      // 모든 알림을 읽음 처리 (병렬 처리)
      await Promise.all(
        unreadNotifications.map(n => NotificationService.markAsRead(n.id))
      )
      
      // 로컬 상태 업데이트
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [notifications])

  // 알림 새로고침 함수 (다른 컴포넌트에서 호출 가능)
  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  // 컴포넌트 마운트 시 알림 로드
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications()
    }
  }, [isAuthenticated, loadNotifications])

  // WebSocket으로 실시간 알림 구독
  useEffect(() => {
    if (!isAuthenticated || typeof window === 'undefined') return

    let mounted = true

    const setupNotificationWebSocket = async () => {
      try {
        const { startWs } = await import('@/lib/services/wsManager')
        
        console.log('[Notification] Setting up WebSocket subscription')
        const ws = await startWs()
        
        if (!mounted) return

        // 실시간 알림 구독
        notificationSubRef.current = ws.subscribe('/user/queue/notifications', (msg) => {
          try {
            console.log('[Notification] 🔔🔔🔔 RAW MESSAGE:', msg.body)
            const notification = JSON.parse(msg.body)
            console.log('[Notification] 🎉 PARSED:', notification)
            alert(`🔔 새 알림: ${notification.message || '알림이 도착했습니다!'}`)
            
            // 새 알림을 맨 앞에 추가
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
            
            // 브라우저 알림 표시 (권한이 있으면)
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

        console.log('[Notification] WebSocket subscription successful')
      } catch (error) {
        console.error('[Notification] WebSocket setup failed:', error)
        // 토큰 없는 경우는 정상 (로그인하지 않은 경우)
        if (error instanceof Error && error.message.includes('Access token is required')) {
          console.log('[Notification] Skipping WebSocket connection (not authenticated)')
        }
      }
    }

    setupNotificationWebSocket()

    // 브라우저 알림 권한 요청
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission().catch(err => {
        console.log('[Notification] Permission request failed:', err)
      })
    }

    return () => {
      mounted = false
      notificationSubRef.current?.unsubscribe()
    }
  }, [isAuthenticated])

  // 로컬 알림 추가 함수 (매칭 성공 시 사용)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification
    }
    
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => prev + 1)
    
    console.log('[Local Notification] Added:', newNotification)
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
