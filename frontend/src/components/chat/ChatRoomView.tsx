'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useChatroom from '@/hooks/useChatroom'
import { useNotifications } from '@/hooks/useNotifications'
import { ArrowLeft, Send } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import { apiClient } from '@/lib/services/api'

interface ChatRoomViewProps {
  chatroomId: number
}

export default function ChatRoomView({ chatroomId }: ChatRoomViewProps) {
  const router = useRouter()
  const { messages, send, reconnect } = useChatroom(chatroomId)
  const { markChatroomNotificationsAsRead, setActiveChatroom, refreshNotifications } = useNotifications()
  const [text, setText] = useState('')
  const [partnerName, setPartnerName] = useState('채팅 상대')
  const [partnerInfo, setPartnerInfo] = useState('')
  const [isPartnerDeleted, setIsPartnerDeleted] = useState(false)
  const cleanupExecuted = useRef(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showNewMessageButton, setShowNewMessageButton] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const [wasAtBottomBeforeNewMessage, setWasAtBottomBeforeNewMessage] = useState(true)

  // 채팅방 정보 조회
  useEffect(() => {
    const fetchChatroomInfo = async () => {
      try {
        const response = await apiClient.get(`/api/v1/chatrooms/${chatroomId}`)
        const chatroomData = response.data
        
        setPartnerName(chatroomData.partnerName || '채팅 상대')
        setPartnerInfo(chatroomData.partnerUniversity || '')
        setIsPartnerDeleted(chatroomData.isPartnerDeleted || false)
        

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

        markChatroomNotificationsAsRead(chatroomId)
        
        setActiveChatroom(chatroomId)
      } catch (error) {
        console.error('채팅방 정보 조회 실패:', error)
      }
    }
    
    fetchChatroomInfo()
  }, [chatroomId])

  // 채팅방 퇴장 시 cleanup
  useEffect(() => {
    return () => {
      if (cleanupExecuted.current) {
        return
      }
      cleanupExecuted.current = true
      
      setActiveChatroom(null)
      
      setTimeout(() => {
        markChatroomNotificationsAsRead(chatroomId)
        
        setTimeout(() => {
          refreshNotifications()
        }, 200)
      }, 100)
      
      const notifyExit = async () => {
        try {
          await apiClient.post(`/api/v1/chatrooms/${chatroomId}/exit`)
        } catch (error) {
          console.error('Failed to notify chatroom exit:', error)
        }
      }
      notifyExit()
    }
  }, [chatroomId, setActiveChatroom, markChatroomNotificationsAsRead, refreshNotifications])

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    send(content)
    setText('')
  }

  // 채팅방 진입 시 메시지 입력창이 보이는 위치로 스크롤
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      setTimeout(() => {
        container.scrollTop = container.scrollHeight - 200
      }, 100)
    }
  }, [chatroomId])

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container
      const isAtBottomNow = scrollTop + clientHeight >= scrollHeight - 10 // 10px 여유
      
      setIsAtBottom(isAtBottomNow)
      setWasAtBottomBeforeNewMessage(isAtBottomNow) // 현재 위치 저장
      
      // 맨 아래에 있으면 새 메시지 버튼 숨김
      if (isAtBottomNow) {
        setShowNewMessageButton(false)
      }
    }
  }

  // 메시지 변경 시 알림 버튼 표시 (상대방 메시지만)
  useEffect(() => {
    if (messagesContainerRef.current && messages.length > 0) {
      // 메시지가 실제로 추가되었는지 확인
      if (messages.length > lastMessageCount) {
        const currentUserId = typeof window !== 'undefined' ? 
          parseInt(localStorage.getItem('userId') || '0') : 0
        
        // 새로 추가된 메시지 중 상대방이 보낸 메시지가 있는지 확인
        const newMessages = messages.slice(lastMessageCount)
        const hasNewMessageFromPartner = newMessages.some(msg => msg.senderId !== currentUserId)
        
        if (hasNewMessageFromPartner) {
          // 상대방이 새 메시지를 보냈을 때
          if (wasAtBottomBeforeNewMessage) {
            // 메시지 추가 전에 맨 아래에 있었으면 자동 스크롤하고 버튼 숨김
            setShowNewMessageButton(false)
            setTimeout(() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
              }
            }, 50)
          } else {
            // 메시지 추가 전에 위쪽에 있었으면 새 메시지 버튼 표시 (자동 스크롤 없음)
            setShowNewMessageButton(true)
          }
        } else {
          // 내가 보낸 메시지일 때는 항상 자동 스크롤
          setTimeout(() => {
            if (messagesContainerRef.current) {
              messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
            }
          }, 50)
          setShowNewMessageButton(false)
        }
      }
      
      // 메시지 개수 업데이트
      setLastMessageCount(messages.length)
    }
  }, [messages, lastMessageCount, wasAtBottomBeforeNewMessage])

  // 새 메시지로 스크롤하는 함수
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTop = container.scrollHeight
      setShowNewMessageButton(false)
    }
  }


  return (
    <div className="fixed inset-0 bg-[#F9FAFB] flex flex-col overflow-hidden">
      <AppHeader />
      
      {/* Chat Info Bar */}
      <div className="bg-white border-b border-[#E5E7EB] z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={async () => {
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
                  console.error('Failed to mark messages as read:', error)
                }
                
                try {
                  await apiClient.post(`/api/v1/chatrooms/${chatroomId}/exit`)
                } catch (error) {
                  console.error('Failed to notify chatroom exit:', error)
                }
                
                setActiveChatroom(null)
                
                router.back()
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className={`font-semibold ${isPartnerDeleted ? 'text-red-500' : 'text-[#111827]'}`}>
                {isPartnerDeleted ? '알 수 없음' : partnerName}
              </h2>
              {isPartnerDeleted ? (
                <p className="text-sm text-red-400">탈퇴한 사용자입니다</p>
              ) : (
                partnerInfo && <p className="text-sm text-[#6B7280]">{partnerInfo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef} 
        className="flex-1 px-4 py-6 space-y-4 overflow-y-auto relative"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요!
          </div>
        ) : (
          messages.map((m) => {
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
      </div>

      {/* 새 메시지 버튼 */}
      {showNewMessageButton && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={scrollToBottom}
            className="bg-[#4F46E5] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#4338CA] transition-colors flex items-center gap-2 border-2 border-white"
          >
            <span className="text-sm font-semibold">새 메시지</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-[#E5E7EB] sticky bottom-0">
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
