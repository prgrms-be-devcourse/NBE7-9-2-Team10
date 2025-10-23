import { createStomp, type StompHandle } from './ws'

let handle: StompHandle | null = null
let connectionPromise: Promise<StompHandle> | null = null

function ensureHandle() {
  if (!handle) {
    try {
      handle = createStomp()
    } catch (error) {
      throw error
    }
  }
  return handle
}

export function getWs(): StompHandle {
  if (!handle) throw new Error('WS not initialized. Call startWs() first.')
  return handle
}

export async function startWs(): Promise<StompHandle> {
  // 이미 연결 중인 경우 기존 Promise 반환
  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = new Promise(async (resolve, reject) => {
    try {
      const h = ensureHandle()
      
      if (h.client.connected) {
        connectionPromise = null
        return resolve(h)
      }
      
      if (h.client.active) {
        const timeout = setTimeout(() => {
          connectionPromise = null
          reject(new Error('WebSocket connection timeout'))
        }, 10000)
        
        const checkConnected = () => {
          if (h.client.connected) {
            clearTimeout(timeout)
            connectionPromise = null
            resolve(h)
          } else if (h.client.active) {
            setTimeout(checkConnected, 100)
          } else {
            clearTimeout(timeout)
            connectionPromise = null
            reject(new Error('WebSocket connection lost'))
          }
        }
        checkConnected()
        return
      }
      
      const timeout = setTimeout(() => {
        connectionPromise = null
        reject(new Error('WebSocket connection timeout'))
      }, 10000)
      
      h.client.onConnect = () => {
        clearTimeout(timeout)
        connectionPromise = null
        setTimeout(() => resolve(h), 100)
      }
      
      h.client.onStompError = (frame) => {
        clearTimeout(timeout)
        connectionPromise = null
        
        // 토큰 관련 에러인 경우 재시도
        if (frame.headers.message?.includes('token') || frame.headers.message?.includes('unauthorized')) {
          setTimeout(() => {
            handle = null // 핸들을 초기화하여 새 토큰으로 재생성
            startWs().then(resolve).catch(reject)
          }, 2000)
        } else {
          reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown error'}`))
        }
      }
      
      h.client.onWebSocketError = (error) => {
        clearTimeout(timeout)
        connectionPromise = null
        reject(new Error('WebSocket error'))
      }
      
      h.client.activate()
    } catch (error) {
      connectionPromise = null
      reject(error)
    }
  })

  return connectionPromise
}

export async function restartWs(): Promise<StompHandle> {
  if (handle) {
    await handle.disconnect()
  }
  handle = null
  connectionPromise = null
  return startWs()
}

export async function stopWs(): Promise<void> {
  if (handle) {
    await handle.disconnect()
    handle = null
  }
  connectionPromise = null
}

// 연결 상태 확인 함수 추가
export function isWsConnected(): boolean {
  return handle?.client.connected || false
}

// 연결 상태 모니터링 함수 추가
export function monitorConnection(): void {
  if (!handle) return
  
  const checkConnection = () => {
    if (handle && !handle.client.connected && !handle.client.active) {
      startWs().catch(error => {
        // 재연결 실패 시 무시
      })
    }
  }
  
  // 5초마다 연결 상태 확인
  setInterval(checkConnection, 5000)
}
