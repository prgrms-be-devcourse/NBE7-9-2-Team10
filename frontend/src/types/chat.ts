export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM'

export interface WsSendMessageRequest {
  chatroomId: number
  content: string
  type?: MessageType
  clientMessageId: string  // 클라이언트에서 생성한 고유 ID
}

export interface WsMessagePush {
  messageId: number
  chatroomId: number
  senderId: number
  content: string
  type: MessageType
  createdAt: string
}

export interface WsSendAckResponse {
  clientMessageId?: string
  messageId: number
  chatroomId: number
  status: 'OK' | 'IGNORED'
}

export interface WsErrorPayload {
  code: string
  message: string
  detail?: unknown
}

export interface WsError {
  error: WsErrorPayload
  timestamp: string
}

// 모듈로 인식되도록 빈 export 추가
export {}