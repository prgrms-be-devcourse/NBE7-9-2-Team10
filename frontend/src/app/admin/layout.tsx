'use client';

import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // ✅ 로그인/회원가입 페이지는 Provider 없이 렌더링
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // ✅ 나머지 관리자 페이지만 Provider로 감싸기
  return <AdminAuthProvider>{children}</AdminAuthProvider>;
}