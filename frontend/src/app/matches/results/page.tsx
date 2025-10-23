'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Layout from '../../../components/layout/Layout';
import { MatchService } from '../../../lib/services/matchService';
import type { MatchResultResponse, MatchResultItem } from '../../../types/match';

export default function MatchResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 매칭 결과 조회
  const fetchMatchResults = async () => {
    try {
      setIsLoading(true);
      const response = await MatchService.getMatchResults();
      const data = (response as any).data || response;
      setResults(data.results || []);
    } catch (error) {
      console.error('매칭 결과 조회 실패:', error);
      setToast({ message: '매칭 결과를 불러오는데 실패했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // 새 매칭 찾기
  const handleFindNewMatches = () => {
    router.push('/matches');
  };

  useEffect(() => {
    fetchMatchResults();
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

  return (
    <ProtectedRoute>
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              성사된 매칭
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {results.length}명의 룸메이트와 매칭되었습니다
            </p>
          </div>
          <Button onClick={handleFindNewMatches} variant="outline">
            룸메이트 더 찾기
          </Button>
        </div>

        {/* 매칭 결과 목록 */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => {
              // 상대방 이름 결정 (현재 사용자 기준)
              const partnerName = result.receiverName; // 백엔드에서 이미 올바른 파트너를 설정함
              
              // 날짜 계산 수정 (confirmedAt이 없거나 유효하지 않은 경우 처리)
              const matchDate = result.confirmedAt ? new Date(result.confirmedAt) : new Date();
              const now = new Date();
              
              // 유효한 날짜인지 확인
              const isValidDate = matchDate instanceof Date && !isNaN(matchDate.getTime());
              
              let timeDisplay = '';
              let daysAgo = 0;
              
              if (isValidDate) {
                const diffTime = now.getTime() - matchDate.getTime();
                daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                // 날짜 표시 포맷
                if (daysAgo < 0) {
                  timeDisplay = '방금';
                } else if (daysAgo === 0) {
                  timeDisplay = '오늘';
                } else if (daysAgo === 1) {
                  timeDisplay = '어제';
                } else if (daysAgo < 7) {
                  timeDisplay = `${daysAgo}일 전`;
                } else if (daysAgo < 30) {
                  const weeksAgo = Math.floor(daysAgo / 7);
                  timeDisplay = `${weeksAgo}주 전`;
                } else {
                  timeDisplay = matchDate.toLocaleDateString('ko-KR', { 
                    month: 'long', 
                    day: 'numeric' 
                  });
                }
              } else {
                timeDisplay = '최근';
              }
              
              return (
                <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* 상대방 정보 헤더 */}
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xl font-bold">
                        {partnerName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {partnerName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
                          ✓ 확정됨
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {timeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 매칭 정보 */}
                  <div className="space-y-3 mb-4">
                    {/* 매칭률 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            매칭률
                          </span>
                        </div>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {Math.round((result.preferenceScore || 0) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round((result.preferenceScore || 0) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* 확정일 */}
                    {isValidDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                        확정일: {matchDate.toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <Button
                    onClick={() => router.push(`/chat`)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    채팅 시작하기
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-purple-400 dark:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              아직 성사된 매칭이 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              추천 목록에서 마음에 드는 룸메이트를 찾아<br />
              좋아요를 보내고 대화를 시작해보세요!
            </p>
            <Button 
              onClick={handleFindNewMatches}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8"
            >
              룸메이트 찾으러 가기
            </Button>
          </div>
        )}

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

