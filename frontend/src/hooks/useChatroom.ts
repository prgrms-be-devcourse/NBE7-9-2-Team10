'use client'

import { useEffect, useRef, useState } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import type {
  WsMessagePush,
  WsSendMessageRequest,
  WsSendAckResponse,
  WsError,
} from '@/types/chat'

function useChatroom(chatroomId: number) {
  const [messages, setMessages] = useState<WsMessagePush[]>([])
  const subRef = useRef<StompSubscription | null>(null)
  const ackRef = useRef<StompSubscription | null>(null)
  const errRef = useRef<StompSubscription | null>(null)

  // 메시지 히스토리 로드
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { apiClient } = await import('@/lib/services/api')
        const response = await apiClient.get(`/api/v1/chatrooms/${chatroomId}/messages`, {
          params: { 
            limit: 100,
            order: 'desc'
          }
        })
        
        const historyData = response.data
        if (historyData.items && Array.isArray(historyData.items)) {
          const historyMessages: WsMessagePush[] = historyData.items.map((msg: any) => ({
            messageId: msg.messageId,
            chatroomId: chatroomId,
            senderId: msg.senderId,
            type: msg.type || 'TEXT',
            content: msg.content,
            createdAt: msg.createdAt
          }))
          
          // 시간 순으로 정렬
          const sortedMessages = historyMessages.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          })
          
          setMessages(sortedMessages)
        }
      } catch (error) {
        console.error('[Message History] Load failed:', error)
      }
    }
    
    loadHistory()
  }, [chatroomId])

  // WebSocket 구독 설정
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let mounted = true
    
    const initWebSocket = async () => {
      try {
        const { startWs } = await import('@/lib/services/wsManager')
        const ws = await startWs()
        
        if (!mounted) return

        // 채팅방 메시지 구독
        subRef.current = ws.subscribe(`/sub/chatroom.${chatroomId}`, (msg) => {
          try {
            const body = JSON.parse(msg.body) as WsMessagePush
            setMessages((prev) => {
              const exists = prev.some(m => m.messageId === body.messageId)
              if (exists) return prev
              return [...prev, body]
            })
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e)
          }
        })

        // ACK 구독
        ackRef.current = ws.subscribe('/user/queue/ack', (msg) => {
          try {
            const ack = JSON.parse(msg.body) as WsSendAckResponse
          } catch (e) {
            console.error('[WebSocket] ACK parsing error:', e)
          }
        })

        // 에러 구독
        errRef.current = ws.subscribe(`/sub/chatroom.${chatroomId}.error`, (msg) => {
          try {
            const err = JSON.parse(msg.body)
            
            if (!err || Object.keys(err).length === 0) return
            
            const errorMessage = err.error || err.message || '알 수 없는 오류'
            
            if (errorMessage.includes('닫힌 채팅방') || 
                errorMessage.includes('차단된 채팅방') ||
                errorMessage.includes('CLOSED') ||
                errorMessage.includes('종료된 채팅방')) {
              alert('메시지 전송 실패\n\n상대방이 채팅방에서 나갔습니다.')
            } else {
              alert(`메시지 전송 실패\n\n${errorMessage}`)
            }
          } catch (e) {
            console.error('[WebSocket] Error parsing error:', e)
            alert('메시지 전송에 실패했습니다.')
          }
        })
      } catch (e) {
        console.error('[WebSocket] Connection error:', e)
        if (e instanceof Error && e.message.includes('Access token is required')) {
          return
        }
        setTimeout(() => {
          if (mounted) initWebSocket()
        }, 5000)
      }
    }
    
    initWebSocket()
    
    return () => {
      mounted = false
      subRef.current?.unsubscribe()
      ackRef.current?.unsubscribe()
      errRef.current?.unsubscribe()
    }
  }, [chatroomId])

  const send = async (content: string) => {
    if (!content.trim()) return
    if (typeof window === 'undefined') return
    
    try {
      const { getWs, startWs } = await import('@/lib/services/wsManager')
      
      let ws
      try {
        ws = getWs()
      } catch {
        ws = await startWs()
      }
      
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const payload: WsSendMessageRequest = {
        chatroomId,
        content,
        type: 'TEXT',
        clientMessageId
      }
      
      ws.publish('/pub/chat.send', payload)
    } catch (e) {
      console.error('[Send error]', e)
      alert('메시지 전송에 실패했습니다.')
    }
  }

  const reconnect = async () => {
    if (typeof window === 'undefined') return
    
    try {
      const { restartWs } = await import('@/lib/services/wsManager')
      await restartWs()
    } catch (e) {
      console.error('[Reconnect error]', e)
    }
  }

  return { messages, send, reconnect }
}

export default useChatroom
