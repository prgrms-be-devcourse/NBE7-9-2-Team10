'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Home, Calendar, Heart, Flag } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import { MatchService } from '../../../../lib/services/matchService';
import { getErrorMessage } from '../../../../lib/utils/helpers';

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params?.id ? Number(params.id) : null;

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 토스트 자동 제거
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 프로필 정보 조회
  useEffect(() => {
    const fetchProfile = async () => {
      if (!candidateId) {
        setToast({ message: '잘못된 사용자 ID입니다.', type: 'error' });
        return;
      }

      try {
        setIsLoading(true);
        const details = await MatchService.getMatchDetail(candidateId);
        setProfile(details);
      } catch (error) {
        console.error('프로필 조회 실패:', error);
        setToast({ message: getErrorMessage(error), type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [candidateId]);

  // 좋아요 보내기
  const handleSendLike = async () => {
    if (!candidateId) return;

    try {
      setIsLiking(true);
      await MatchService.sendLike(candidateId);
      setToast({ message: '좋아요를 보냈습니다!', type: 'success' });
      
      // 프로필 다시 조회
      const details = await MatchService.getMatchDetail(candidateId);
      setProfile(details);
    } catch (error) {
      setToast({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setIsLiking(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">프로필을 찾을 수 없습니다.</p>
            <Button onClick={() => router.back()}>돌아가기</Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const getSleepTimeText = (sleepTime: number) => {
    switch (sleepTime) {
      case 5: return '22시 이전 (일찍 취침)';
      case 4: return '22시~00시 (보통 취침)';
      case 3: return '00시~02시 (늦게 취침)';
      case 2: return '02시~04시 (새벽 취침)';
      case 1: return '04시 이후 (아침 취침)';
      default: return '정보 없음';
    }
  };

  const getCleaningText = (frequency: number) => {
    switch (frequency) {
      case 5: return '매일 청소';
      case 4: return '주 2~3회 (깔끔한 편)';
      case 3: return '주 1회 (보통)';
      case 2: return '월 1~2회 (여유로운 편)';
      case 1: return '거의 안함 (자유로운 편)';
      default: return '정보 없음';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* 헤더 */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">프로필 상세</h1>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 기본 정보 카드 */}
          <Card className="p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-4xl font-bold">
                  {profile.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {profile.age}세
                  </span>
                  <span>·</span>
                  <span>{profile.gender === 'MALE' ? '남성' : '여성'}</span>
                  <span>·</span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium">
                    {profile.mbti}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  🏫 {profile.university}
                </p>
                {profile.studentVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    ✓ 학생 인증 완료
                  </span>
                )}
              </div>
            </div>

            {/* 매칭률 */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  매칭률
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {profile.preferenceScore ? Math.round(profile.preferenceScore * 100) : 0}%
                </span>
              </div>
              <div className="h-3 bg-white/50 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${profile.preferenceScore ? Math.round(profile.preferenceScore * 100) : 0}%` }}
                />
              </div>
            </div>
          </Card>

          {/* 거주 정보 */}
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-purple-500" />
              거주 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">거주 시작일</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile.startUseDate ? new Date(profile.startUseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '정보 없음'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">거주 종료일</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {profile.endUseDate ? new Date(profile.endUseDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '정보 없음'}
                </p>
              </div>
            </div>
          </Card>

          {/* 생활 습관 */}
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">생활 습관</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">수면 시간</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {getSleepTimeText(profile.sleepTime)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">청소 빈도</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {getCleaningText(profile.cleaningFrequency)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">흡연 여부</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.isSmoker ? '🚬 흡연' : '🚭 비흡연'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">반려동물</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.isPetAllowed ? '🐕 허용' : '🚫 불가'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">코골이</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.isSnoring ? '있음' : '없음'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">위생 수준</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {'⭐'.repeat(profile.hygieneLevel || 0)} ({profile.hygieneLevel}/5)
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">소음 민감도</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.noiseSensitivity}/5
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">음주 빈도</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.drinkingFrequency}/5
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">손님 초대 빈도</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile.guestFrequency}/5
                </p>
              </div>
            </div>
          </Card>

          {/* 액션 버튼 */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                돌아가기
              </Button>
              <Button
                onClick={handleSendLike}
                disabled={isLiking || profile.matchStatus === 'PENDING' || profile.matchStatus === 'ACCEPTED'}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLiking ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </span>
                ) : profile.matchStatus === 'ACCEPTED' ? (
                  <span className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-current" />
                    매칭 완료
                  </span>
                ) : profile.matchStatus === 'PENDING' ? (
                  <span className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-current" />
                    좋아요 보냄
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    좋아요 보내기
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* 토스트 */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <span className="text-lg">{toast.type === 'success' ? '✅' : '❌'}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

