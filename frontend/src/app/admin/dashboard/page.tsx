'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthService from '@/lib/services/AdminAuthService';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 관리자 인증 확인
    if (!AdminAuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // 클라이언트에서만 localStorage 접근
    const email = localStorage.getItem('adminEmail') || '';
    setAdminEmail(email);
    setIsLoading(false);
  }, [router]);

  const handleLogout = async () => {
    await AdminAuthService.logout();
    router.push('/admin/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{adminEmail}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
          <p className="text-gray-600">관리자 대시보드에 성공적으로 로그인했습니다.</p>
        </div>
      </main>
    </div>
  );
}