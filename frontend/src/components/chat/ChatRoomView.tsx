'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useChatroom from '@/hooks/useChatroom'
import { ArrowLeft, Send } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import { apiClient } from '@/lib/services/api'

interface ChatRoomViewProps {
  chatroomId: number
}

export default function ChatRoomView({ chatroomId }: ChatRoomViewProps) {
  const router = useRouter()
  const { messages, send, reconnect } = useChatroom(chatroomId)
  const [text, setText] = useState('')
  const [partnerName, setPartnerName] = useState('채팅 상대')
  const [partnerInfo, setPartnerInfo] = useState('')
  const [isPartnerDeleted, setIsPartnerDeleted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 페이지를 떠날 때 채팅방 퇴장 알림 및 메시지 읽음 처리
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // 페이지를 떠날 때 채팅방 퇴장을 백엔드에 알림
      navigator.sendBeacon(`/api/v1/chatrooms/${chatroomId}/leave-notification`, JSON.stringify({}))
      
      // 채팅방 퇴장 시 최신 메시지를 읽음 처리
      try {
        const messagesResponse = await apiClient.get(
          `/api/v1/chatrooms/${chatroomId}/messages`,
          { params: { limit: 1 } }
        )
        const messages = messagesResponse.data.items || []
        
        if (messages.length > 0) {
          const message = messages[0]
          const latestMessageId = message.messageId || message.id
          
          if (latestMessageId) {
            await apiClient.post(`/api/v1/chatrooms/${chatroomId}/read`, {
              lastReadMessageId: latestMessageId
            })
          }
        }
      } catch (error) {
        // 퇴장 시 읽음 처리 실패는 무시
      }
    }

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // 페이지가 숨겨졌을 때 (다른 탭으로 이동)
        navigator.sendBeacon(`/api/v1/chatrooms/${chatroomId}/leave-notification`, JSON.stringify({}))
        
        // 채팅방 퇴장 시 최신 메시지를 읽음 처리
        try {
          const messagesResponse = await apiClient.get(
            `/api/v1/chatrooms/${chatroomId}/messages`,
            { params: { limit: 1 } }
          )
          const messages = messagesResponse.data.items || []
          
          if (messages.length > 0) {
            const message = messages[0]
            const latestMessageId = message.messageId || message.id
            
            if (latestMessageId) {
              await apiClient.post(`/api/v1/chatrooms/${chatroomId}/read`, {
                lastReadMessageId: latestMessageId
              })
            }
          }
        } catch (error) {
          // 퇴장 시 읽음 처리 실패는 무시
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [chatroomId])

  // 채팅방 정보 조회 및 읽음 처리
  useEffect(() => {
    const fetchChatroomInfo = async () => {
      try {
        const response = await apiClient.get(`/api/v1/chatrooms/${chatroomId}`)
        const chatroomData = response.data
        
        
        // 백엔드에서 이미 partnerName, partnerUniversity, isPartnerDeleted를 보내줌
        setPartnerName(chatroomData.partnerName || '채팅 상대')
        setPartnerInfo(chatroomData.partnerUniversity || '')
        setIsPartnerDeleted(chatroomData.isPartnerDeleted || false)

        // 채팅방에 들어갔을 때 읽음 처리
        try {
          const messagesResponse = await apiClient.get(
            `/api/v1/chatrooms/${chatroomId}/messages`,
            { params: { limit: 1 } }
          )
          const messages = messagesResponse.data.items || []
          
          if (messages.length > 0) {
            const message = messages[0]
            const latestMessageId = message.messageId || message.id
            
            if (latestMessageId) {
              await apiClient.post(`/api/v1/chatrooms/${chatroomId}/read`, {
                lastReadMessageId: latestMessageId
              })
            }
          }
        } catch (error) {
          // 읽음 처리 실패는 무시
        }
      } catch (error) {
        // 채팅방 정보 조회 실패는 무시
      }
    }
    
    fetchChatroomInfo()
  }, [chatroomId])

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    send(content)
    setText('')
  }

  // 초기 로드 시 맨 아래로 스크롤 (즉시)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showNewMessageButton, setShowNewMessageButton] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  
  // 스크롤 위치 감지
  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    
    const container = messagesContainerRef.current
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    
    if (isAtBottom) {
      setShowNewMessageButton(false)
    }
  }
  
  useEffect(() => {
    if (messages.length > 0) {
      if (isInitialLoad) {
        // 초기 로드 시에는 즉시 스크롤
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
        setIsInitialLoad(false)
        setLastMessageCount(messages.length)
      } else {
        // 새 메시지가 올 때
        if (messages.length > lastMessageCount) {
          const container = messagesContainerRef.current
          if (container) {
            const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
            
            if (isAtBottom) {
              // 사용자가 맨 아래에 있으면 자동 스크롤
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            } else {
              // 사용자가 위에 있으면 새 메시지 버튼 표시
              setShowNewMessageButton(true)
            }
          }
          setLastMessageCount(messages.length)
        }
      }
    }
  }, [messages, isInitialLoad, lastMessageCount])
  
  // 새 메시지 버튼 클릭 시 맨 아래로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowNewMessageButton(false)
  }


  return (
    <div className="h-screen bg-[#F9FAFB] flex flex-col relative">
      <AppHeader />
      
      {/* Chat Info Bar */}
      <div className="bg-white border-b border-[#E5E7EB] flex-shrink-0">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className={`font-semibold ${isPartnerDeleted ? 'text-red-500' : 'text-[#111827]'}`}>
                {partnerName}
              </h2>
              {isPartnerDeleted ? (
                <p className="text-sm text-red-400">이 사용자는 탈퇴했습니다</p>
              ) : (
                partnerInfo && <p className="text-sm text-[#6B7280]">{partnerInfo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 relative"
        onScroll={handleScroll}
      >
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            messages.map((m) => {
              // 현재 사용자 ID를 localStorage에서 가져오기
              const currentUserId = typeof window !== 'undefined' ? 
                parseInt(localStorage.getItem('userId') || '0') : 0
              const isMe = m.senderId === currentUserId
              const messageTime = new Date(m.createdAt).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              
              return (
                <div
                  key={m.messageId}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-3 rounded-2xl ${
                      isMe
                        ? 'bg-[#4F46E5] text-white'
                        : 'bg-white border border-[#E5E7EB] text-[#111827]'
                    }`}
                  >
                    <p className="mb-1">{m.content}</p>
                    <p
                      className={`text-xs ${
                        isMe ? 'text-[#C7D2FE]' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {messageTime}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          {/* 스크롤을 위한 빈 div */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* 새 메시지 버튼 - 메시지 컨테이너 밖에 고정 */}
      {showNewMessageButton && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToBottom}
            className="bg-[#4F46E5] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#4338CA] transition-colors flex items-center gap-2"
          >
            <span className="text-sm font-medium">새 메시지</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-[#E5E7EB] flex-shrink-0">
        <div className="px-4 py-4">
          {isPartnerDeleted ? (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-xl">
              <p className="text-sm">탈퇴한 사용자와는 메시지를 주고받을 수 없습니다</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                placeholder="메시지를 입력하세요..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage(text)
                  }
                }}
                className="flex-1 px-4 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
              <button
                onClick={() => sendMessage(text)}
                disabled={!text.trim()}
                className="w-12 h-12 bg-[#4F46E5] text-white rounded-xl flex items-center justify-center hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
