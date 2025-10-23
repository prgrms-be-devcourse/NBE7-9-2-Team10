'use client';

import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import AdminHeader from '@/components/layout/AdminHeader';

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <AdminHeader />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">환영합니다!</h2>
            <p className="text-gray-600">
              관리자 대시보드에 성공적으로 로그인했습니다.
            </p>
          </div>
        </main>
      </div>
    </AdminProtectedRoute>
  );
}