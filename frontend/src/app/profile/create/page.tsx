import ProfileCreateForm from '@/components/profile/ProfileCreateForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProfileCreatePage() {
  return (
    <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <ProfileCreateForm />
      </div>
    </ProtectedRoute>
  );
}
