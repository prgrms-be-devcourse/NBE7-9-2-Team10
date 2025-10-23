import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function MatchesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
          매칭 정보를 불러오는 중...
        </p>
      </div>
    </div>
  );
}

