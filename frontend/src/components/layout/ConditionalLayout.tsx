'use client'

import { usePathname } from 'next/navigation'
import Layout from './Layout'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname()
  
  // 채팅방 페이지에서는 Layout을 사용하지 않음
  if (pathname?.startsWith('/chat/')) {
    return <>{children}</>
  }
  
  // 다른 페이지에서는 기본 Layout 사용
  return (
    <Layout showHeader={false}>
      {children}
    </Layout>
  )
}

export default ConditionalLayout

