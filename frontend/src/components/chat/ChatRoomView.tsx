'use client'

import { useState, useEffect } from 'react'
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

  // 채팅방 정보 조회
  useEffect(() => {
    const fetchChatroomInfo = async () => {
      try {
        const response = await apiClient.get(`/api/v1/chatrooms/${chatroomId}`)
        const chatroomData = response.data
        
        // 상대방 ID 추출
        const currentUserId = Number(localStorage.getItem('userId'))
        const partnerId = chatroomData.user1Id === currentUserId 
          ? chatroomData.user2Id 
          : chatroomData.user1Id
        
        // 상대방 정보 조회 (user 테이블에서)
        try {
          const userResponse = await apiClient.get(`/api/v1/user/${partnerId}`)
          const user = userResponse.data
          setPartnerName(user.name || `사용자 ${partnerId}`)
          setPartnerInfo(user.university || '')
        } catch {
          setPartnerName(`사용자 ${partnerId}`)
          setPartnerInfo('')
        }
      } catch (error) {
        console.error('채팅방 정보 조회 실패:', error)
      }
    }
    
    fetchChatroomInfo()
  }, [chatroomId])

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    send(content)
    setText('')
  }


  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <AppHeader />
      
      {/* Chat Info Bar */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-16 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="font-semibold text-[#111827]">{partnerName}</h2>
              {partnerInfo && <p className="text-sm text-[#6B7280]">{partnerInfo}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
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
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-[#E5E7EB] sticky bottom-0">
        <div className="px-4 py-4">
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
        </div>
      </div>
    </div>
  )
}
