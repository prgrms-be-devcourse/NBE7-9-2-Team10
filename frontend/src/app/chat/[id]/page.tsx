import ChatRoomView from '@/components/chat/ChatRoomView'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chatroomId = Number(id)

  // Mock data for partner info (실제로는 API에서 가져와야 함)
  const getPartnerInfo = (id: number) => {
    const partners = {
      1: { name: '정수아', university: 'Harvard' },
      2: { name: '이지은', university: 'MIT' },
      3: { name: '김서연', university: 'Stanford' },
    }
    return partners[id as keyof typeof partners] || { name: '알 수 없음', university: '알 수 없음' }
  }
  
  const partnerInfo = getPartnerInfo(chatroomId)

  return (
    <ProtectedRoute>
      <ChatRoomView 
        chatroomId={chatroomId} 
        partnerName={partnerInfo.name}
        partnerUniversity={partnerInfo.university}
      />
    </ProtectedRoute>
  )
}
