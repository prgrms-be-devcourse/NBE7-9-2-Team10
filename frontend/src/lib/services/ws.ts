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

export function createStomp(): StompHandle {
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  const token = getAuthToken();
  if (!token) {
    throw new Error('Access token is required for WebSocket connection');
  }


  const client = new Client({
    webSocketFactory: () => {
      const sockjs = new SockJS(WS_HTTP_ENDPOINT, null, {
        transports: ['websocket', 'xhr-streaming', 'xhr-polling']
      })
      return sockjs
    },
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: token ? {
      'Authorization': `Bearer ${token}`,
      'access-token': token
    } : {},
    onStompError: (frame) => {
      // 토큰 만료 시 재연결 시도
      if (frame.headers.message?.includes('token') || frame.headers.message?.includes('unauthorized')) {
        setTimeout(() => {
          if (client.connected) {
            client.deactivate()
          }
        }, 1000)
      }
    },
    onWebSocketError: (error) => {
      // WebSocket 연결 에러 처리
    },
    onDisconnect: () => {
      // WebSocket 연결 해제 처리
    }
  })

  return {
    client,
    subscribe: (dest, cb) => {
      if (!client.connected) {
        throw new Error('STOMP client is not connected. Ensure startWs() is awaited before subscribing.')
      }
      return client.subscribe(dest, cb)
    },
    publish: (dest, body) => {
      if (!client.connected) {
        return
      }
      client.publish({ destination: dest, body: JSON.stringify(body) })
    },
    disconnect: () => client.deactivate(),
  }
}
