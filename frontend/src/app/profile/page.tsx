'use client';

import { useRouter } from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfilePage() {
  const router = useRouter();

  const handleCreateProfile = () => {
    router.push('/profile/create');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <ProfileView onCreate={handleCreateProfile} onEdit={handleEditProfile} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
