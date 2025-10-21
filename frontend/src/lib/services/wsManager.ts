import { createStomp, type StompHandle } from './ws'

let handle: StompHandle | null = null

function ensureHandle() {
  if (!handle) handle = createStomp()
  return handle
}

/** 현재 WS 핸들 반환 (startWs() 후 사용 가능) */
export function getWs(): StompHandle {
  if (!handle) throw new Error('WS not initialized. Call startWs() first.')
  return handle
}

/** 최초 연결 or 이미 있으면 재활용 */
export async function startWs(): Promise<StompHandle> {
  const h = ensureHandle()
  
  // 이미 연결되어 있으면 재사용
  if (h.client.connected) {
    console.log('[WS Manager] WebSocket already connected, reusing connection')
    return h
  }
  
  // 연결 중이면 대기
  if (h.client.active) {
    console.log('[WS Manager] WebSocket connection in progress, waiting...')
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'))
      }, 10000)
      
      const checkConnected = () => {
        if (h.client.connected) {
          clearTimeout(timeout)
          console.log('[WS Manager] Connection established')
          resolve(h)
        } else {
          setTimeout(checkConnected, 100)
        }
      }
      checkConnected()
    })
  }
  
  // 새로 연결 시작
  console.log('[WS Manager] Activating new WebSocket connection...')
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error('[WS Manager] WebSocket connection timeout after 10 seconds')
      reject(new Error('WebSocket connection timeout'))
    }, 10000)
    
    h.client.onConnect = (frame) => {
      clearTimeout(timeout)
      console.log('[WS Manager] WebSocket connected successfully:', frame)
      
      // connected 상태가 true가 될 때까지 약간 대기
      setTimeout(() => {
        console.log('[WS Manager] Connection fully established, ready for subscriptions')
        resolve(h)
      }, 100)
    }
    
    h.client.onStompError = (frame) => {
      clearTimeout(timeout)
      console.error('[WS Manager] WebSocket connection failed:')
      console.error('  Command:', frame.command)
      console.error('  Headers:', frame.headers)
      console.error('  Body:', frame.body)
      reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown error'}`))
    }
    
    h.client.onWebSocketError = (error) => {
      clearTimeout(timeout)
      console.error('[WS Manager] WebSocket error:', error)
      reject(new Error('WebSocket error'))
    }
    
    console.log('[WS Manager] Starting WebSocket activation...')
    h.client.activate()
  })
}

/** 재연결 (토큰 갱신 등 필요 시) */
export async function restartWs(): Promise<StompHandle> {
  if (handle) await handle.disconnect()
  handle = createStomp()
  handle.client.activate()
  return handle
}

/** WebSocket 연결 종료 (로그아웃 시 사용) */
export async function stopWs(): Promise<void> {
  if (handle) {
    console.log('[WS Manager] Disconnecting WebSocket...')
    await handle.disconnect()
    handle = null
    console.log('[WS Manager] WebSocket disconnected')
  }
}
