import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface StompHandle {
  client: Client
  subscribe: (dest: string, cb: (msg: IMessage) => void) => StompSubscription
  publish: (dest: string, body: unknown) => void
  disconnect: () => Promise<void>
}

// 모듈로 인식되도록 빈 export 추가
export {}

const WS_HTTP_ENDPOINT = 'http://localhost:8080/ws-stomp'

/**
 * STOMP 클라이언트 생성 (SockJS 기반)
 * 쿠키 인증이므로 Authorization 헤더 불필요
 */
export function createStomp(): StompHandle {
  // localStorage에서 JWT 토큰 가져오기
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // 토큰이 없으면 연결하지 않음
  const token = getAuthToken();
  if (!token) {
    console.error('[STOMP] No access token found, cannot establish WebSocket connection');
    throw new Error('Access token is required for WebSocket connection');
  }

  const client = new Client({
    webSocketFactory: () => {
      console.log('[STOMP] Creating SockJS connection to:', WS_HTTP_ENDPOINT)
      // SockJS는 자동으로 쿠키를 포함합니다
      const sockjs = new SockJS(WS_HTTP_ENDPOINT, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling']
      })
      return sockjs
    },
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    // JWT 토큰을 connectHeaders에 포함
    connectHeaders: token ? {
      'Authorization': `Bearer ${token}`,
      'access-token': token
    } : {},
    onStompError: (frame) => {
      console.error('[STOMP ERROR] Connection failed:')
      console.error('  Command:', frame.command)
      console.error('  Headers:', frame.headers)
      console.error('  Body:', frame.body)
      console.error('  Message:', frame.headers.message || 'No error message')
    },
    onWebSocketError: (error) => {
      console.error('[WebSocket ERROR]', error)
    },
    onConnect: (frame) => {
      console.log('[STOMP] Connected successfully:', frame)
    },
    onDisconnect: (frame) => {
      console.log('[STOMP] Disconnected:', frame)
    },
    debug: (str) => {
      console.log('[STOMP DEBUG]', str)
    }
  })

  // 클라이언트 활성화는 wsManager에서 처리
  // client.activate()는 여기서 호출하지 않음

  return {
    client,
    subscribe: (dest, cb) => {
      if (!client.connected) {
        console.error('[STOMP] Not connected! Call startWs() and wait before subscribing:', dest)
        throw new Error('STOMP client is not connected. Ensure startWs() is awaited before subscribing.')
      }
      // 연결되어 있으면 바로 구독
      console.log(`[STOMP] Subscribing to: ${dest}`)
      return client.subscribe(dest, cb)
    },
    publish: (dest, body) => {
      if (!client.connected) {
        console.error('[STOMP] Not connected, cannot publish to:', dest)
        console.error('[STOMP] Message:', body)
        return
      }
      console.log(`[STOMP] Publishing to: ${dest}`, body)
      client.publish({ destination: dest, body: JSON.stringify(body) })
    },
    disconnect: () => client.deactivate(),
  }
}
