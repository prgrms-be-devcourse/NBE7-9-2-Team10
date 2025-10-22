import ChatRoomView from '@/components/chat/ChatRoomView'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chatroomId = Number(id)

  return (
    <ProtectedRoute>
      <ChatRoomView chatroomId={chatroomId} />
    </ProtectedRoute>
  )
}
