'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Heart, MessageCircle, Star, MapPin, Calendar, User } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useToast } from '@/components/ui/Toast'
import { useNotifications } from '@/hooks/useNotifications'

// Mock 프로필 데이터
const mockProfiles = {
  1: {
    id: 1,
    name: '김서연',
    university: 'Stanford University',
    major: 'Computer Science',
    age: 22,
    location: 'Palo Alto, CA',
    bio: '안녕하세요! 컴퓨터 공학을 전공하고 있는 김서연입니다. 깔끔한 생활을 선호하고, 조용한 환경에서 공부하는 것을 좋아해요.',
    interests: ['공부', '독서', '요리', '영화감상'],
    lifestyle: {
      sleepTime: '23:00',
      wakeTime: '07:00',
      smoking: false,
      drinking: '가끔',
      cleaning: '매일'
    },
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    ]
  },
  2: {
    id: 2,
    name: '이지은',
    university: 'MIT',
    major: 'Mathematics',
    age: 21,
    location: 'Cambridge, MA',
    bio: '수학을 사랑하는 이지은입니다. 논리적이고 체계적인 생활을 선호해요.',
    interests: ['수학', '퍼즐', '클래식 음악', '산책'],
    lifestyle: {
      sleepTime: '22:30',
      wakeTime: '06:30',
      smoking: false,
      drinking: '안함',
      cleaning: '매일'
    },
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face'
    ]
  },
  3: {
    id: 3,
    name: '정수아',
    university: 'Harvard University',
    major: 'Psychology',
    age: 23,
    location: 'Cambridge, MA',
    bio: '심리학을 전공하고 있는 정수아입니다. 사람들과의 소통을 중요하게 생각해요.',
    interests: ['심리학', '요가', '독서', '여행'],
    lifestyle: {
      sleepTime: '00:00',
      wakeTime: '08:00',
      smoking: false,
      drinking: '가끔',
      cleaning: '주 3-4회'
    },
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop&crop=face'
    ]
  }
}

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error } = useToast()
  const { addNotification } = useNotifications()
  
  const [profile, setProfile] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const profileId = parseInt(params.id as string)

  useEffect(() => {
    // 프로필 데이터 로드
    const profileData = mockProfiles[profileId as keyof typeof mockProfiles]
    if (profileData) {
      setProfile(profileData)
      // 이미 좋아요를 눌렀는지 확인 (localStorage에서)
      const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]')
      setIsLiked(likedProfiles.includes(profileId))
    }
    setIsLoading(false)
  }, [profileId])

  const handleLike = async () => {
    if (!profile) return

    try {
      if (isLiked) {
        // 이미 좋아요를 눌렀다면 채팅방 생성
        await createChatroom(profile.id)
      } else {
        // 좋아요 누르기
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]')
        likedProfiles.push(profileId)
        localStorage.setItem('likedProfiles', JSON.stringify(likedProfiles))
        
        setIsLiked(true)
        success(`${profile.name}님에게 좋아요를 보냈습니다!`, '좋아요 전송')
        
        // 상대방에게 알림 전송 (실제로는 서버 API 호출)
        addNotification({
          type: 'like',
          message: `${profile.name}님이 회원님을 좋아합니다.`,
          senderName: profile.name,
          senderId: profile.id
        })
      }
    } catch (err) {
      error('오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const createChatroom = async (partnerId: number) => {
    try {
      // 실제로는 서버 API 호출
      const chatroomId = Math.floor(Math.random() * 1000) + 1
      
      // 채팅방 생성 알림
      addNotification({
        type: 'match',
        message: `${profile.name}님과 매칭되었습니다!`,
        senderName: profile.name,
        senderId: profile.id,
        chatroomId: chatroomId
      })
      
      success('매칭되었습니다! 채팅방으로 이동합니다.', '매칭 성공')
      
      // 채팅방으로 이동
      setTimeout(() => {
        router.push(`/chat/${chatroomId}`)
      }, 1500)
      
    } catch (err) {
      error('채팅방 생성에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F9FAFB]">
          <AppHeader />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F9FAFB]">
          <AppHeader />
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">프로필을 찾을 수 없습니다</h2>
              <p className="text-gray-600">존재하지 않는 프로필입니다.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9FAFB]">
        <AppHeader />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 프로필 헤더 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                {/* 프로필 사진 */}
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <img 
                    src={profile.photos[0]} 
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 기본 정보 */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
                  <p className="text-gray-600 mb-2">{profile.university} • {profile.major}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {profile.age}세
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 좋아요 버튼 */}
              <button
                onClick={handleLike}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  isLiked 
                    ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                    : 'bg-pink-500 text-white hover:bg-pink-600'
                }`}
              >
                <Heart className="w-5 h-5" />
                {isLiked ? '채팅하기' : '좋아요'}
              </button>
            </div>
          </div>

          {/* 프로필 내용 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 소개 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">소개</h2>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>

            {/* 관심사 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">관심사</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* 생활 패턴 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">생활 패턴</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">취침 시간</span>
                  <span className="font-medium">{profile.lifestyle.sleepTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기상 시간</span>
                  <span className="font-medium">{profile.lifestyle.wakeTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">흡연</span>
                  <span className="font-medium">{profile.lifestyle.smoking ? '함' : '안함'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">음주</span>
                  <span className="font-medium">{profile.lifestyle.drinking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">청소</span>
                  <span className="font-medium">{profile.lifestyle.cleaning}</span>
                </div>
              </div>
            </div>

            {/* 사진 갤러리 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">사진</h2>
              <div className="grid grid-cols-2 gap-4">
                {profile.photos.map((photo: string, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img 
                      src={photo} 
                      alt={`${profile.name} 사진 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

