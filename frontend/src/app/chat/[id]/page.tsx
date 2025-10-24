'use client'

import { useEffect, useState } from 'react'
import ChatRoomView from '@/components/chat/ChatRoomView'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const [chatroomId, setChatroomId] = useState<number | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setChatroomId(Number(id))
    })
  }, [params])

  if (!chatroomId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <ChatRoomView chatroomId={chatroomId} />
    </ProtectedRoute>
  )
}
