'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, MoreVertical, Trash2 } from 'lucide-react'
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
  isNew?: boolean // NEW 배지 표시 여부
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
            
            // NEW 배지 표시 여부 확인 (localStorage에서 방문 기록 확인)
            const visitedChatrooms = JSON.parse(localStorage.getItem('visitedChatrooms') || '[]')
            const isNew = !visitedChatrooms.includes(chat.chatroomId)
            
            return {
              ...chat,
              lastMessage: lastMsg ? lastMsg.content : '매칭되었습니다! 안녕하세요 👋',
              lastMessageTime: lastMsg ? lastMsg.createdAt : chat.createdAt,
              partnerName: partnerName,
              unreadCount: unreadCount,
              isNew: isNew
            }
          } catch (error) {
            // NEW 배지 표시 여부 확인 (localStorage에서 방문 기록 확인)
            const visitedChatrooms = JSON.parse(localStorage.getItem('visitedChatrooms') || '[]')
            const isNew = !visitedChatrooms.includes(chat.chatroomId)
            
            return {
              ...chat,
              lastMessage: '매칭되었습니다! 안녕하세요 👋',
              lastMessageTime: chat.createdAt,
              partnerName: chat.partnerName || '알 수 없는 사용자',
              unreadCount: 0,
              isNew: isNew
            }
          }
        })
      )
      
      // 최신 메시지 시간순으로 정렬 (최신이 위로)
      const sortedChats = chatroomsWithMessages.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.createdAt).getTime()
        const timeB = new Date(b.lastMessageTime || b.createdAt).getTime()
        return timeB - timeA // 내림차순 (최신이 위로)
      })
      
      setChats(sortedChats)
    } catch (error) {
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

  const handleChatClick = async (chatId: number) => {
    // 채팅방에 들어갈 때 안 읽음 개수를 0으로 업데이트하고 NEW 배지 제거
    setChats(chats.map(chat => 
      chat.chatroomId === chatId 
        ? { ...chat, unreadCount: 0, isNew: false }
        : chat
    ))
    
    // 채팅방 진입 시 읽음 처리
    try {
      const messagesResponse = await apiClient.get(
        `/api/v1/chatrooms/${chatId}/messages`,
        { params: { limit: 1 } }
      )
      const messages = messagesResponse.data.items || []
      
      if (messages.length > 0) {
        const message = messages[0]
        const latestMessageId = message.messageId || message.id
        
        if (latestMessageId) {
          await apiClient.post(`/api/v1/chatrooms/${chatId}/read`, {
            lastReadMessageId: latestMessageId
          })
        }
      }
    } catch (error) {
      // 읽음 처리 실패는 무시
    }
    
    // 채팅방 방문 기록 저장 (NEW 배지 제거용)
    const visitedChatrooms = JSON.parse(localStorage.getItem('visitedChatrooms') || '[]')
    if (!visitedChatrooms.includes(chatId)) {
      visitedChatrooms.push(chatId)
      localStorage.setItem('visitedChatrooms', JSON.stringify(visitedChatrooms))
    }
    
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
      alert('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.')
    }
  }


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9FAFB]">
        <AppHeader />

        {/* Main Content */}
        <div className="px-4 py-6">
          {/* Title */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-[#111827]">채팅</h1>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <p className="text-[#6B7280] text-sm">매칭된 룸메이트와 대화를 나눠보세요</p>
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
                onClick={() => router.push('/matches')}
                className="text-[#4F46E5] font-medium hover:underline"
              >
                매칭 페이지로 가기 →
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {chats.map((chat) => (
                <div
                  key={chat.chatroomId}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer relative border border-gray-100"
                  onClick={() => {
                    // 메뉴가 열려있으면 채팅방으로 이동하지 않음
                    if (showMenu !== chat.chatroomId) {
                      handleChatClick(chat.chatroomId)
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#111827]">{chat.partnerName || `사용자 ${chat.partnerId || chat.user1Id || chat.user2Id}`}</h3>
                          {chat.isNew && (
                            <span className="bg-[#EF4444] text-white text-xs px-2 py-1 rounded font-semibold">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#9CA3AF]">
                            {chat.lastMessageTime 
                              ? new Date(chat.lastMessageTime).toLocaleTimeString('ko-KR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })
                              : new Date(chat.createdAt).toLocaleDateString('ko-KR')
                            }
                          </span>
                          {chat.unreadCount && chat.unreadCount > 0 ? (
                            <span className="bg-[#4F46E5] text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-semibold">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-[#6B7280] truncate">
                        {chat.lastMessage || '매칭되었습니다! 안녕하세요 👋'}
                      </p>
                    </div>

                    {/* Menu Button */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowMenu(showMenu === chat.chatroomId ? null : chat.chatroomId)
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-[#6B7280]" />
                      </button>

                      {/* Dropdown Menu */}
                      {showMenu === chat.chatroomId && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowMenu(null)}
                          />
                          <div className="absolute right-0 top-10 w-48 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-20 overflow-hidden">
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
                  </div>
                </div>
              ))}
              </div>
            </>
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
