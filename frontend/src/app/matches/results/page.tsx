'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import Layout from '../../../components/layout/Layout';
import { MatchService } from '../../../lib/services/matchService';
import { getErrorMessage } from '../../../lib/utils/helpers';
import type { MatchResultResponse, MatchResultItem } from '../../../types/match';
import { User, Calendar, Home, Phone } from 'lucide-react';

interface EnrichedMatchResult extends MatchResultItem {
  partnerDetails?: any; // 상세 정보
}

export default function MatchResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<EnrichedMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 토스트 자동 제거
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 매칭 결과 조회
  const fetchMatchResults = async () => {
    try {
      setIsLoading(true);
      const response = await MatchService.getMatchResults();
      const data = (response as any).data || response;
      const matchResults = data.results || [];
      
      // 각 매칭 결과에 대한 연락처 정보 가져오기
      const enrichedResults = await Promise.all(
        matchResults.map(async (result: MatchResultItem) => {
          try {
            const details = await MatchService.getMatchDetail(result.receiverId);
            return {
              ...result,
              partnerDetails: details
            };
          } catch (error) {
            console.error(`Failed to fetch details for user ${result.receiverId}:`, error);
            return result;
          }
        })
      );
      
      setResults(enrichedResults);
    } catch (error) {
      console.error('매칭 결과 조회 실패:', error);
      setToast({ message: getErrorMessage(error), type: 'error' });
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
              
              const details = result.partnerDetails;
              const university = details?.university;
              const startDate = details?.startUseDate;
              const endDate = details?.endUseDate;

              return (
                <Card key={result.id} className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
                  {/* 상대방 정보 헤더 */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-3xl font-bold">
                        {partnerName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {partnerName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-semibold">
                          ✓ 매칭 확정
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {timeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 실용 정보 */}
                  <div className="space-y-3 mb-6">
                    {/* 대학교 */}
                    {university && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <User className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">학교</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {university}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 룸쉐어 기간 */}
                    {startDate && endDate && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Home className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">룸쉐어 기간</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(startDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} ~ {new Date(endDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 확정일 */}
                    {isValidDate && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">확정일</p>
                          <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                            {matchDate.toLocaleDateString('ko-KR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <Button
                    onClick={() => router.push(`/chat`)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl py-4 text-lg font-semibold"
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

