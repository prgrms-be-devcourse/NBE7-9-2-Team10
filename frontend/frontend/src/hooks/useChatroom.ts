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
          params: { limit: 100 }
        })
        
        console.log('[Message History] Loaded:', response.data)
        
        // 응답 형태: { items: [...], nextCursor: ... }
        const historyData = response.data
        if (historyData.items && Array.isArray(historyData.items)) {
          // 백엔드 메시지를 WsMessagePush 형태로 변환
          const historyMessages: WsMessagePush[] = historyData.items.map((msg: any) => ({
            messageId: msg.messageId,
            chatroomId: chatroomId,
            senderId: msg.senderId,
            type: 'TEXT',
            content: msg.content,
            createdAt: msg.createdAt
          }))
          
          setMessages(historyMessages)
          console.log('[Message History] Loaded messages:', historyMessages.length)
        }
      } catch (error) {
        console.error('[Message History] Load failed:', error)
      }
    }
    
    loadHistory()
  }, [chatroomId])

  useEffect(() => {
    // 클라이언트에서만 WebSocket 연결
    if (typeof window === 'undefined') return

    let mounted = true

    const initWebSocket = async () => {
      try {
        const { getWs, startWs } = await import('@/lib/services/wsManager')

        console.log(`[WebSocket] Starting connection for chatroom ${chatroomId}`)
        await startWs()
        const ws = getWs()

        if (!mounted) return

        console.log(`[WebSocket] Connected, subscribing to chatroom ${chatroomId}`)

        subRef.current = ws.subscribe(`/sub/chatroom.${chatroomId}`, (msg) => {
          try {
            const body = JSON.parse(msg.body) as WsMessagePush
            setMessages((prev) => [...prev, body])
            console.log(`[WebSocket] Received message:`, body)
          } catch (e) {
            console.error('[WebSocket] Message parsing error:', e)
          }
        })

        ackRef.current = ws.subscribe('/user/queue/ack', (msg) => {
          try {
            const ack = JSON.parse(msg.body) as WsSendAckResponse
            console.log('[ACK]', ack)
          } catch (e) {
            console.error('[WebSocket] ACK parsing error:', e)
          }
        })

        errRef.current = ws.subscribe('/user/queue/error', (msg) => {
          try {
            const err = JSON.parse(msg.body) as WsError
            console.error('[WS ERROR]', err)
          } catch (e) {
            console.error('[WebSocket] Error parsing error:', e)
          }
        })

        console.log(`[WebSocket] Successfully subscribed to chatroom ${chatroomId}`)
      } catch (e) {
        console.error('[WS start error]', e)
        // 연결 실패 시 재시도
        setTimeout(() => {
          if (mounted) {
            console.log('[WebSocket] Retrying connection...')
            initWebSocket()
          }
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
      const { getWs } = await import('@/lib/services/wsManager')
      // 고유한 clientMessageId 생성 (타임스탬프 + 랜덤)
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const payload: WsSendMessageRequest = {
        chatroomId,
        content,
        type: 'TEXT',
        clientMessageId
      }
      console.log('[Send] Sending message with clientMessageId:', clientMessageId)
      getWs().publish('/pub/chat.send', payload)
    } catch (e) {
      console.error('[Send error]', e)
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

