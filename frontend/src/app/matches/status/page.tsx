'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MatchStatusCard } from '../../../components/matches/MatchStatusCard';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Layout from '../../../components/layout/Layout';
import { MatchService } from '../../../lib/services/matchService';
import type { MatchStatusResponse } from '../../../types/match';

export default function MatchStatusPage() {
  const router = useRouter();
  const [matchStatus, setMatchStatus] = useState<MatchStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 매칭 상태 조회
  const fetchMatchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await MatchService.getMatchStatus();
      const data = (response as any).data || response;
      setMatchStatus(data);
    } catch (error) {
      console.error('매칭 상태 조회 실패:', error);
      setToast({ message: '매칭 상태를 불러오는데 실패했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 새로고침
  const handleRefresh = () => {
    fetchMatchStatus();
  };

  // 추천 목록으로 이동
  const handleViewRecommendations = () => {
    router.push('/matches');
  };

  // 결과 보기
  const handleViewResults = () => {
    router.push('/matches/results');
  };

  useEffect(() => {
    fetchMatchStatus();
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout showFooter={false}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!matchStatus) {
    return (
      <ProtectedRoute>
        <Layout showFooter={false}>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  매칭 상태를 불러올 수 없습니다
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  잠시 후 다시 시도해주세요.
                </p>
                <Button onClick={handleRefresh}>
                  다시 시도
                </Button>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              매칭 상태
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              현재 매칭 상태와 진행 상황을 확인하세요
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            새로고침
          </Button>
        </div>

        {/* 매칭 상태 카드 */}
        <div className="mb-8">
          <MatchStatusCard
            status={matchStatus}
            onViewResults={handleViewResults}
            onViewMatches={handleViewRecommendations}
          />
        </div>

        {/* 매칭 목록 */}
        {matchStatus.matches && matchStatus.matches.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              매칭 목록
            </h2>
            {matchStatus.matches.map((match) => (
              <Card key={match.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {match.partner.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {match.partner.university}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    match.matchStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    match.matchStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {match.matchStatus === 'PENDING' && '대기 중'}
                    {match.matchStatus === 'ACCEPTED' && '수락됨'}
                    {match.matchStatus === 'REJECTED' && '거절됨'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {match.matchType === 'LIKE' ? '💝 좋아요' : '✨ 정식 룸메 신청'}
                  </div>
                  {match.message && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                      {match.message}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>매칭률: {Math.round((match.preferenceScore || 0) * 100)}%</span>
                    <span>•</span>
                    <span>
                      {new Date(match.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-4 justify-center">
          <Button onClick={handleViewRecommendations}>
            새 매칭 찾기
          </Button>
          <Button variant="outline" onClick={handleViewResults}>
            결과 보기
          </Button>
        </div>

        {/* 토스트 */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
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
                  <p className="text-sm">{toast.message}</p>
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
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

