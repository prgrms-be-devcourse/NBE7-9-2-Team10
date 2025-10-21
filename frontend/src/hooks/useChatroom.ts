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
            // 최신 메시지부터 가져오기 위한 파라미터 (백엔드 API에 따라 다름)
            order: 'desc' 
          }
        })
        
        console.log('[Message History] API Response:', response.data)
        
        // 응답 형태: { items: [...], nextCursor: ... }
        const historyData = response.data
        if (historyData.items && Array.isArray(historyData.items)) {
          // 백엔드 메시지를 WsMessagePush 형태로 변환
          const historyMessages: WsMessagePush[] = historyData.items.map((msg: any) => ({
            messageId: msg.messageId,
            chatroomId: chatroomId,
            senderId: msg.senderId,
            type: msg.type || 'TEXT',
            content: msg.content,
            createdAt: msg.createdAt
          }))
          
          // 메시지를 시간 순으로 정렬 (오래된 것 -> 최신 것)
          const sortedMessages = historyMessages.sort((a, b) => {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          })
          
          setMessages(sortedMessages)
          console.log('[Message History] Loaded messages:', sortedMessages.length)
          if (sortedMessages.length > 0) {
            console.log('[Message History] First (oldest) message:', {
              id: sortedMessages[0].messageId,
              content: sortedMessages[0].content,
              time: sortedMessages[0].createdAt
            })
            console.log('[Message History] Last (newest) message:', {
              id: sortedMessages[sortedMessages.length - 1].messageId,
              content: sortedMessages[sortedMessages.length - 1].content,
              time: sortedMessages[sortedMessages.length - 1].createdAt
            })
          }
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
        const { startWs } = await import('@/lib/services/wsManager')
        
        console.log(`[WebSocket] Starting connection for chatroom ${chatroomId}`)
        const ws = await startWs() // startWs()가 연결 완료까지 대기
        
        if (!mounted) return

        console.log(`[WebSocket] Connected, subscribing to chatroom ${chatroomId}`)
        console.log(`[WebSocket] Client connected status: ${ws.client.connected}`)

        subRef.current = ws.subscribe(`/sub/chatroom.${chatroomId}`, (msg) => {
          try {
            const body = JSON.parse(msg.body) as WsMessagePush
            // 중복 메시지 방지 (이미 있는 messageId는 추가하지 않음)
            setMessages((prev) => {
              const exists = prev.some(m => m.messageId === body.messageId)
              if (exists) {
                console.log(`[WebSocket] Duplicate message ignored:`, body.messageId)
                return prev
              }
              console.log(`[WebSocket] New message received:`, body.content)
              return [...prev, body]
            })
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

        // ⭐ 채팅방별 에러 큐 구독
        errRef.current = ws.subscribe(`/sub/chatroom.${chatroomId}.error`, (msg) => {
          try {
            const err = JSON.parse(msg.body)
            
            // 빈 객체 무시
            if (!err || Object.keys(err).length === 0) {
              return
            }
            
            // 백엔드에서 보내는 형식: { message, error, chatroomId }
            let errorMessage = err.error || err.message || '알 수 없는 오류'
            
            // 채팅방 관련 에러 처리
            if (errorMessage.includes('닫힌 채팅방') || 
                errorMessage.includes('차단된 채팅방') ||
                errorMessage.includes('CLOSED') ||
                errorMessage.includes('종료된 채팅방')) {
              alert('❌ 메시지 전송 실패\n\n상대방이 채팅방에서 나갔습니다.')
            } else {
              alert(`❌ 메시지 전송 실패\n\n${errorMessage}`)
            }
          } catch (e) {
            console.error('[WebSocket] Error parsing error:', e)
            alert('❌ 메시지 전송에 실패했습니다.')
          }
        })

        console.log(`[WebSocket] Successfully subscribed to chatroom ${chatroomId}`)
      } catch (e) {
        console.error('[WS start error]', e)
        // 토큰 없는 경우 재시도하지 않음
        if (e instanceof Error && e.message.includes('Access token is required')) {
          console.error('[WebSocket] Cannot connect without access token')
          return
        }
        // 기타 에러는 재시도
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
      const { getWs, startWs } = await import('@/lib/services/wsManager')
      
      // 연결이 안 되어 있으면 먼저 연결
      let ws
      try {
        ws = getWs()
      } catch {
        console.log('[Send] WebSocket not initialized, starting...')
        ws = await startWs()
      }
      
      // 고유한 clientMessageId 생성 (타임스탬프 + 랜덤)
      const clientMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const payload: WsSendMessageRequest = {
        chatroomId,
        content,
        type: 'TEXT',
        clientMessageId
      }
      console.log('[Send] Sending message with clientMessageId:', clientMessageId)
      
      // WebSocket 전송 시도
      try {
        ws.publish('/pub/chat.send', payload)
      } catch (wsError) {
        console.error('[Send] WebSocket error:', wsError)
        alert('❌ 메시지 전송에 실패했습니다.')
      }
      
    } catch (e) {
      console.error('[Send error]', e)
      alert('❌ 메시지 전송에 실패했습니다.')
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
