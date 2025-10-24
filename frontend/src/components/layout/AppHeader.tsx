'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, MessageCircle, User, Star, Bell, LogOut } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationModal from '@/components/notification/NotificationModal'
import MatchDetailModal from '@/components/matches/MatchDetailModal'
import { useToast } from '@/components/ui/Toast'
import { stopWs } from '@/lib/services/wsManager'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationService } from '@/lib/services/notificationService'
import { MatchService } from '@/lib/services/matchService'
import { getErrorMessage } from '@/lib/utils/helpers'
import type { MatchRecommendationDetailResponse } from '@/types/match'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'

export default function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<MatchRecommendationDetailResponse | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const { notifications, unreadCount, markAsRead, deleteNotification, deleteAllNotifications, checkWebSocketStatus } = useNotifications()
  const { success } = useToast()
  const { isAuthenticated, isLoading, logout } = useAuth()

  const navigationItems = [
    { key: '/', label: '홈', icon: Home },
    { key: '/matches', label: '매칭', icon: Users },
    { key: '/chat', label: '채팅', icon: MessageCircle },
    { key: '/profile', label: '프로필', icon: User },
  ]

  const handleLogout = async () => {
    try {
      await stopWs()
      await logout()
      success('로그아웃되었습니다.', '로그아웃 완료')
      // 로그아웃 후 홈화면으로 강제 이동
      window.location.href = '/'
    } catch (error) {
      success('로그아웃되었습니다.', '로그아웃 완료')
      // 에러가 발생해도 홈화면으로 강제 이동
      window.location.href = '/'
    }
  }

  const handleViewProfile = async (senderId: number) => {
    setIsDetailLoading(true)
    setIsDetailModalOpen(false)
    setIsNotificationOpen(false)
    
    try {
      const detail = await MatchService.getMatchDetail(senderId)
      setSelectedUser(detail)
      setIsDetailLoading(false)
      setIsDetailModalOpen(true)
    } catch (err) {
      console.error('상세 정보 조회 실패:', err)
      setIsDetailLoading(false)
      // 에러 발생 시 기존 방식으로 프로필 페이지로 이동
      router.push(`/profile/${senderId}`)
    }
  }

  const handleViewChat = (chatroomId: number) => {
    router.push(`/chat/${chatroomId}`)
    setIsNotificationOpen(false)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedUser(null)
  }

  const handleLikeFromModal = async (receiverId: number) => {
    await MatchService.sendLike(receiverId)
  }

  const handleCancelLikeFromModal = async (receiverId: number) => {
    await MatchService.cancelLike(receiverId)
  }

  const handleCheckWebSocketStatus = async () => {
    await checkWebSocketStatus()
  }

  const handleSendTestNotification = async () => {
    try {
      // 현재 알림 목록 새로고침
      await NotificationService.getNotifications(0, 5)
      success('알림 목록을 새로고침했습니다. 다른 계정으로 알림을 생성해보세요.', '테스트 안내')
    } catch (error) {
      // 테스트 알림 전송 실패는 무시
    }
  }

  if (isLoading) {
    return (
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4F46E5]"></div>
        </div>
      </header>
    )
  }

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-xl font-bold text-[#4F46E5]">UniMate</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                로그인
              </button>
            </Link>
            <Link href="/register">
              <button className="px-4 py-2 bg-[#4F46E5] text-white hover:bg-[#4338CA] rounded-lg transition-colors">
                회원가입
              </button>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="text-xl font-bold text-[#4F46E5]">UniMate</span>
        </button>

        <nav className="flex items-center gap-6">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.key
            
            return (
              <button
                key={item.key}
                onClick={() => router.push(item.key)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#4F46E5] bg-[#EEF2FF] font-semibold'
                    : 'text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-[#F59E0B]" />
          </div>
          
          <div className="relative flex items-center">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              title="알림"
              className="flex items-center hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-[#6B7280]" />
            </button>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4F46E5] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center hover:bg-gray-100 rounded-lg transition-colors"
            title="로그아웃"
          >
            <LogOut className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDeleteNotification={deleteNotification}
        onDeleteAllNotifications={deleteAllNotifications}
        onViewProfile={handleViewProfile}
        onViewChat={handleViewChat}
      />

      {/* 상세 정보 로딩 오버레이 */}
      {isDetailLoading && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-[45] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 mt-4">상세 정보를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      <MatchDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        match={selectedUser}
        onLike={handleLikeFromModal}
        onCancelLike={handleCancelLikeFromModal}
        isLiked={selectedUser ? (selectedUser.isLiked || (selectedUser.matchType === 'LIKE' && selectedUser.matchStatus === 'PENDING')) : false}
      />
    </header>
  )
}
