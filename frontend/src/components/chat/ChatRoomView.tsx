'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useChatroom from '@/hooks/useChatroom'
import { ArrowLeft, Send, User, Flag, Ban } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'

interface ChatRoomViewProps {
  chatroomId: number
  partnerName?: string
  partnerUniversity?: string
}

export default function ChatRoomView({ 
  chatroomId, 
  partnerName = "정수아", 
  partnerUniversity = "Harvard" 
}: ChatRoomViewProps) {
  const router = useRouter()
  const { messages, send, reconnect } = useChatroom(chatroomId)
  const [text, setText] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('연결 중...')
  const [showReportModal, setShowReportModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // WebSocket 연결 상태 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 연결 상태를 주기적으로 확인
      const checkConnection = async () => {
        try {
          const { getWs } = await import('@/lib/services/wsManager')
          const ws = getWs()
          if (ws && ws.client) {
            if (ws.client.connected) {
              setIsConnected(true)
              setConnectionStatus('연결됨')
            } else {
              setIsConnected(false)
              setConnectionStatus('연결 중...')
            }
          } else {
            setIsConnected(false)
            setConnectionStatus('초기화 중...')
          }
        } catch (e) {
          console.error('[Connection Check Error]', e)
          setIsConnected(false)
          setConnectionStatus('연결 실패')
        }
      }
      
      // 초기 확인을 더 자주 실행
      setTimeout(checkConnection, 500)
      setTimeout(checkConnection, 1500)
      setTimeout(checkConnection, 3000)
      
      // 주기적 확인
      const interval = setInterval(checkConnection, 2000)
      
      return () => clearInterval(interval)
    }
  }, [])

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    send(content)
    setText('')
  }

  const handleReport = () => {
    alert(`${partnerName}님에 대한 신고가 접수되었습니다.`)
    setShowReportModal(false)
  }

  const handleBlock = () => {
    alert(`${partnerName}님을 차단했습니다.`)
    setShowBlockModal(false)
    router.push('/chat')
  }


  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <AppHeader />
      
      {/* Chat Info Bar */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-16 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="font-semibold text-[#111827]">{partnerName}</h2>
                <p className="text-sm text-[#6B7280]">{partnerUniversity}</p>
              </div>
            </div>
            
            {/* Profile, Report and Block Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3 py-2 flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                프로필
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="px-3 py-2 flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Flag className="w-4 h-4" />
                신고
              </button>
              <button
                onClick={() => setShowBlockModal(true)}
                className="px-3 py-2 flex items-center gap-2 text-sm text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg transition-colors"
              >
                <Ban className="w-4 h-4" />
                차단
              </button>
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">사용자 신고</h3>
                <p className="text-sm text-[#6B7280]">{partnerName}님을 신고하시겠습니까?</p>
              </div>
            </div>

            <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl mb-4">
              <p className="text-sm text-[#991B1B]">
                허위 신고 시 계정 이용이 제한될 수 있습니다. 신중하게 신고해주세요.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                신고하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                <Ban className="w-6 h-6 text-[#EF4444]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#111827]">사용자 차단</h3>
                <p className="text-sm text-[#6B7280]">{partnerName}님을 차단하시겠습니까?</p>
              </div>
            </div>

            <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl mb-4">
              <p className="text-sm text-[#991B1B]">
                차단하면 더 이상 이 사용자와 대화할 수 없으며, 채팅 목록에서도 사라집니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleBlock}
                className="flex-1 px-4 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
              >
                차단하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] mb-2">{partnerName}</h2>
                <div className="flex items-center gap-4 text-sm text-[#6B7280]">
                  <span>{partnerUniversity} · 컴퓨터공학</span>
                  <span>22세</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#4F46E5]">95%</div>
                <div className="text-sm text-[#6B7280]">매칭률</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-sm rounded-full">조용함</span>
              <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-sm rounded-full">깔끔함</span>
              <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-sm rounded-full">아침형</span>
              <span className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-sm rounded-full">INTJ</span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-[#111827] mb-3">자기소개</h3>
              <p className="text-[#6B7280]">
                안녕하세요! 조용하고 깔끔한 룸메이트를 찾고 있어요. 평일에는 주로 학교나 도서관에서 공부하고, 주말에는 집에서 쉬는 것을 좋아합니다.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-[#111827] mb-3">생활 패턴</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">취침 시간</div>
                  <div className="font-medium text-[#111827]">밤 10시 - 아침 6시</div>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">청결도</div>
                  <div className="font-medium text-[#111827]">매우 높음</div>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">소음 민감도</div>
                  <div className="font-medium text-[#111827]">높음</div>
                </div>
                <div className="p-4 bg-[#F9FAFB] rounded-lg">
                  <div className="text-xs text-[#6B7280] mb-1">흡연</div>
                  <div className="font-medium text-[#111827]">비흡연</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
