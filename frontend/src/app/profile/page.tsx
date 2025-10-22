'use client';

import { useRouter } from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppHeader from '@/components/layout/AppHeader';

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
      <div className="min-h-screen bg-[#F9FAFB]">
        <AppHeader />
        
        {/* Main Content */}
        <div className="px-4 py-8">
          <ProfileView onCreate={handleCreateProfile} onEdit={handleEditProfile} />
        </div>
      </div>
    </ProtectedRoute>
  );
}