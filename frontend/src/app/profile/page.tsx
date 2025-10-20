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
        <ProfileView onCreate={handleCreateProfile} onEdit={handleEditProfile} />
      </div>
    </ProtectedRoute>
  );
}
