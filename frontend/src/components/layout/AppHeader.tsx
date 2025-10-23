'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Users, MessageCircle, User, Star, Bell, LogOut, Shield } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationModal from '@/components/notification/NotificationModal'
import { useToast } from '@/components/ui/Toast'
import { stopWs } from '@/lib/services/wsManager'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications()
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
      console.error('Logout error:', error)
      success('로그아웃되었습니다.', '로그아웃 완료')
      // 에러가 발생해도 홈화면으로 강제 이동
      window.location.href = '/'
    }
  }

  const handleViewProfile = (senderId: number) => {
    router.push(`/profile/${senderId}`)
    setIsNotificationOpen(false)
  }

  const handleViewChat = (chatroomId: number) => {
    router.push(`/chat/${chatroomId}`)
    setIsNotificationOpen(false)
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
          <div className="relative">
            <Star className="w-5 h-5 text-[#F59E0B]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-white text-xs rounded-full flex items-center justify-center">
              3
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
        onViewProfile={handleViewProfile}
        onViewChat={handleViewChat}
      />
    </header>
  )
}
