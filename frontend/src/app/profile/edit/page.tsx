import ProfileEditForm from '@/components/profile/ProfileEditForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfileEditPage() {
  return (
    <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <ProfileEditForm />
      </div>
    </ProtectedRoute>
  );
}
