'use client';

import { useState, useEffect } from 'react';
import { MatchService } from '@/lib/services/matchService';
import { getErrorMessage } from '@/lib/utils/helpers';
import UserCard from '@/components/matches/UserCard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import MatchPreferenceModal from '@/components/profile/MatchPreferenceModal';
import ConfirmModal from '@/components/ui/ConfirmModal'; // 확인 모달 임포트
import { useRouter } from 'next/navigation';

// TODO: 백엔드 DTO에 맞춰 타입 정의 필요
type RecommendedUser = any;

// 매칭 선호도를 등록하지 않았을 때 보여줄 컴포넌트
const PreferencePrompt = ({ onOpenModal }: { onOpenModal: () => void }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-6 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">매칭 선호도 등록</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
      당신의 생활 패턴과 선호도를 등록하면 더욱 정확한 룸메이트 추천을 받을 수 있습니다.
    </p>
    <Button onClick={onOpenModal} size="lg">선호도 등록하기</Button>
  </div>
);

export default function MatchesPage() {
  const [users, setUsers] = useState<RecommendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  // TODO: API 연동을 통해 실제 매칭 상태 값으로 교체해야 합니다.
  const [hasPreferences, setHasPreferences] = useState(false);
  const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // 매칭 취소 모달 상태
  const router = useRouter();

  useEffect(() => {
    const checkMatchStatus = async () => {
      setIsLoading(true);
      try {
        // TODO: 응답 DTO에 맞춰 any 타입 수정 필요
        const response = await MatchService.getMatchStatus();
        const matchStatus = (response as any).data?.data || (response as any).data || response;
        
        // 백엔드 응답에 따라 선호도 등록 여부 판단
        // 예: isPreferenceSet, preferenceExists 등 실제 키값으로 변경 필요
        if (matchStatus && matchStatus.hasPreference) {
          setHasPreferences(true);
        } else {
          setHasPreferences(false);
        }
      } catch (err) {
        // 404 Not Found는 선호도가 없는 상태로 간주, 그 외는 에러로 처리
        if ((err as any).status === 404) {
          setHasPreferences(false);
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkMatchStatus();
  }, []);

  useEffect(() => {
    if (hasPreferences) {
      const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
          const response = await MatchService.getRecommendations();
          const rawData = (response as any).data?.data || (response as any).data || response;
          setUsers(rawData.recommendations || []);
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [hasPreferences]);

  const handleLikeChange = (receiverId: number, isLiked: boolean) => {
    setUsers(currentUsers =>
      currentUsers.map(user =>
        user.receiverId === receiverId ? { ...user, isLiked } : user
      )
    );
  };

  const handleOpenPreferenceModal = () => setIsPreferenceModalOpen(true);
  const handleClosePreferenceModal = () => setIsPreferenceModalOpen(false);
  
  const openCancelModal = () => setIsCancelModalOpen(true);
  const closeCancelModal = () => setIsCancelModalOpen(false);

  const handleCancelMatching = async () => {
    try {
      await MatchService.cancelMatching();
      setHasPreferences(false);
      // TODO: 성공 토스트 메시지 표시
    } catch (err) {
      setError(getErrorMessage(err));
      // TODO: 실패 토스트 메시지 표시
    } finally {
      closeCancelModal();
    }
  };

  const handlePreferenceSave = () => {
    setHasPreferences(true);
    handleClosePreferenceModal();
    // 데이터를 다시 불러오거나 페이지를 새로고침 할 수 있습니다.
    // router.refresh(); // Next.js 13+ App Router
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : hasPreferences ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">추천 룸메이트</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    {users.length}명의 추천 룸메이트를 확인해보세요.
                  </p>
                </div>
                <Button onClick={openCancelModal} variant="danger">매칭 상태 취소</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <UserCard
                    key={user.receiverId}
                    user={user}
                    onLikeChange={handleLikeChange}
                  />
                ))}
              </div>
            </>
          ) : (
            <PreferencePrompt onOpenModal={handleOpenPreferenceModal} />
          )}
        </div>
      </div>
      <MatchPreferenceModal 
        isOpen={isPreferenceModalOpen} 
        onClose={handleClosePreferenceModal}
        onSave={handlePreferenceSave}
      />
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelMatching}
        title="매칭 상태 취소"
        message="정말 매칭을 취소하시겠습니까? 매칭을 취소하면 더 이상 룸메이트 추천을 받을 수 없습니다. 다시 이용하려면 선호도를 재등록해야 합니다."
        confirmText="취소하기"
        cancelText="돌아가기"
      />
    </ProtectedRoute>
  );
}