'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAuthService from '@/lib/services/AdminAuthService';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!AdminAuthService.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
          <p className="text-gray-600">관리자 대시보드에 성공적으로 로그인했습니다.</p>
        </div>
      </main>
    </div>
  );
}