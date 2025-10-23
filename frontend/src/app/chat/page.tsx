'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, MoreVertical, Trash2, MessageCirclePlus } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { apiClient } from '@/lib/services/api'

interface ChatRoom {
  chatroomId: number
  user1Id?: number
  user2Id?: number
  partnerId?: number
  status: string
  createdAt: string
  lastMessage?: string
  lastMessageTime?: string
  partnerName?: string
  unreadCount?: number
  isNew?: boolean
}

export default function ChatListPage() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showMenu, setShowMenu] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)

  // 채팅방 목록 조회 함수
  const fetchChatrooms = async () => {
    try {
      setIsLoading(true)
      // apiClient를 직접 사용 (백엔드 API 경로: /api/v1/chatrooms)
      const response = await apiClient.get('/api/v1/chatrooms')
      
      const data = response.data
      const chatrooms = data.items || []
      
      // 각 채팅방의 최신 메시지와 상대방 이름 가져오기
      const chatroomsWithMessages = await Promise.all(
        chatrooms.map(async (chat: ChatRoom) => {
          try {
            // 최신 메시지 가져오기
            const messagesResponse = await apiClient.get(
              `/api/v1/chatrooms/${chat.chatroomId}/messages`,
              { 
                params: { 
                  limit: 1,
                  order: 'desc' // 최신 메시지부터
                } 
              }
            )
            const messages = messagesResponse.data.items || []
            const lastMsg = messages[0]

            // 백엔드에서 이미 올바른 unreadCount를 계산해서 보내주므로 그대로 사용
            const unreadCount = chat.unreadCount || 0
            
            // 백엔드에서 이미 partnerName을 보내주므로 별도 조회 불필요
            const partnerName = chat.partnerName || '알 수 없는 사용자'
            
            return {
              ...chat,
              lastMessage: lastMsg ? lastMsg.content : '상호 좋아요로 매칭되었습니다!',
              lastMessageTime: lastMsg ? lastMsg.createdAt : chat.createdAt,
              partnerName: partnerName,
              unreadCount: unreadCount,
              isNew: !lastMsg // 메시지가 없으면 새로 매칭된 채팅방
            }
          } catch (error) {
            console.error(`채팅방 ${chat.chatroomId} 메시지 로드 실패:`, error)
            return {
              ...chat,
              lastMessage: '상호 좋아요로 매칭되었습니다!',
              lastMessageTime: chat.createdAt,
              partnerName: chat.partnerName || '알 수 없는 사용자',
              unreadCount: 0,
              isNew: true // 에러가 발생한 경우도 새로 매칭된 것으로 간주
            }
          }
        })
      )
      
      setChats(chatroomsWithMessages)
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: error instanceof Error && 'response' in error ? (error as any).response?.status : undefined,
        data: error instanceof Error && 'response' in error ? (error as any).response?.data : undefined
      })
      setChats([])
    } finally {
      setIsLoading(false)
    }
  }

  // 채팅방 목록 조회
  useEffect(() => {
    fetchChatrooms()
  }, [])

  // 페이지가 포커스될 때 채팅 목록 새로고침 (채팅방에서 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      fetchChatrooms()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const handleChatClick = (chatId: number) => {
    // 채팅방에 들어갈 때 안 읽음 개수를 0으로 업데이트하고 NEW 태그 제거
    setChats(chats.map(chat => 
      chat.chatroomId === chatId 
        ? { ...chat, unreadCount: 0, isNew: false }
        : chat
    ))
    router.push(`/chat/${chatId}`)
  }

  const handleDeleteChat = async (chatId: number) => {
    try {
      // 채팅방 나가기 API 사용
      await apiClient.post(`/api/v1/chatrooms/${chatId}/leave`)
      setChats(chats.filter(chat => chat.chatroomId !== chatId))
      setShowDeleteModal(null)
      setShowMenu(null)
    } catch (error) {
      console.error('채팅방 나가기 실패:', error)
      alert('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9FAFB]">
        <AppHeader />

        {/* Main Content */}
        <div className="px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-[#111827]">채팅</h1>
              <button
                onClick={() => router.push('/matches')}
                className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-xl hover:bg-[#4338CA] transition-colors shadow-sm"
              >
                <MessageCirclePlus className="w-5 h-5" />
                <span className="font-medium">새 메시지</span>
              </button>
            </div>
            <p className="text-[#6B7280]">매칭된 룸메이트와 대화를 나눠보세요</p>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5] mx-auto"></div>
              <p className="mt-4 text-[#6B7280]">채팅방 목록을 불러오는 중...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#9CA3AF]" />
              </div>
              <h3 className="text-lg font-semibold text-[#111827] mb-2">아직 매칭된 대화가 없습니다</h3>
              <p className="text-[#6B7280] mb-6">
                매칭 페이지에서 마음에 드는 프로필에 좋아요를 눌러보세요.<br />
                상대방도 좋아요를 누르면 채팅방이 생성됩니다!
              </p>
              <button 
                onClick={() => router.push('/match')}
                className="text-[#4F46E5] font-medium hover:underline"
              >
                매칭 페이지로 가기 →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <div
                  key={chat.chatroomId}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer relative group"
                  onClick={(e) => {
                    // 메뉴가 열려있지 않을 때만 채팅방으로 이동
                    if (showMenu !== chat.chatroomId) {
                      handleChatClick(chat.chatroomId)
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#111827] text-lg">{chat.partnerName || `사용자 ${chat.partnerId || chat.user1Id || chat.user2Id}`}</h3>
                      {chat.isNew && (
                        <span className="bg-[#EF4444] text-white text-xs px-2 py-1 rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#9CA3AF]">
                        {chat.lastMessageTime 
                          ? (() => {
                              const now = new Date()
                              const messageTime = new Date(chat.lastMessageTime)
                              const diff = now.getTime() - messageTime.getTime()
                              const minutes = Math.floor(diff / 60000)
                              const hours = Math.floor(diff / 3600000)
                              const days = Math.floor(diff / 86400000)
                              
                              if (minutes < 1) return '방금 전'
                              if (minutes < 60) return `${minutes}분 전`
                              if (hours < 24) return `${hours}시간 전`
                              if (days < 7) return `${days}일 전`
                              return messageTime.toLocaleDateString('ko-KR')
                            })()
                          : '방금 전'
                        }
                      </span>
                      {chat.unreadCount && chat.unreadCount > 0 ? (
                        <div className="w-6 h-6 bg-[#4F46E5] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </div>
                      ) : null}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(showMenu === chat.chatroomId ? null : chat.chatroomId)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-[#6B7280]" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {chat.lastMessage || '상호 좋아요로 매칭되었습니다👋'}
                  </p>

                  {/* Dropdown Menu */}
                  {showMenu === chat.chatroomId && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(null)}
                      />
                      <div className="absolute right-4 top-16 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowDeleteModal(chat.chatroomId)
                            setShowMenu(null)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#FEE2E2] transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          <span className="text-sm text-[#EF4444]">채팅방 나가기</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Delete Chat Modal */}
          {showDeleteModal !== null && (
            <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FEE2E2] rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-[#EF4444]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827]">채팅방 나가기</h3>
                    <p className="text-sm text-[#6B7280]">이 채팅방에서 나가시겠습니까?</p>
                  </div>
                </div>

                <div className="p-4 bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl mb-4">
                  <p className="text-sm text-[#991B1B]">
                    나간 채팅방은 다시 들어갈 수 없습니다.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDeleteChat(showDeleteModal)}
                    className="flex-1 px-4 py-3 bg-[#EF4444] text-white rounded-lg hover:bg-[#DC2626] transition-colors"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
