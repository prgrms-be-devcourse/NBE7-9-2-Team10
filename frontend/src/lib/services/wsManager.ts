import { createStomp, type StompHandle } from './ws'

let handle: StompHandle | null = null

function ensureHandle() {
  if (!handle) handle = createStomp()
  return handle
}

export function getWs(): StompHandle {
  if (!handle) throw new Error('WS not initialized. Call startWs() first.')
  return handle
}

export async function startWs(): Promise<StompHandle> {
  const h = ensureHandle()
  
  if (h.client.connected) {
    return h
  }
  
  if (h.client.active) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'))
      }, 10000)
      
      const checkConnected = () => {
        if (h.client.connected) {
          clearTimeout(timeout)
          resolve(h)
        } else {
          setTimeout(checkConnected, 100)
        }
      }
      checkConnected()
    })
  }
  
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'))
    }, 10000)
    
    h.client.onConnect = () => {
      clearTimeout(timeout)
      setTimeout(() => resolve(h), 100)
    }
    
    h.client.onStompError = (frame) => {
      clearTimeout(timeout)
      reject(new Error(`WebSocket connection failed: ${frame.headers.message || 'Unknown error'}`))
    }
    
    h.client.onWebSocketError = (error) => {
      clearTimeout(timeout)
      reject(new Error('WebSocket error'))
    }
    
    h.client.activate()
  })
}

export async function restartWs(): Promise<StompHandle> {
  if (handle) await handle.disconnect()
  handle = createStomp()
  handle.client.activate()
  return handle
}

export async function stopWs(): Promise<void> {
  if (handle) {
    await handle.disconnect()
    handle = null
  }
}
