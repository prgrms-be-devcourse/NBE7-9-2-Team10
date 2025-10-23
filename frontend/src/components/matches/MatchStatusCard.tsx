'use client';

import { Card } from '../ui/Card';
import Button from '../ui/Button';
import type { MatchStatusResponse } from '../../types/match';

interface MatchStatusCardProps {
  status: MatchStatusResponse;
  onViewResults: () => void;
  onViewMatches: () => void;
}

export const MatchStatusCard = ({ status, onViewResults, onViewMatches }: MatchStatusCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            매칭 상태
          </h3>
          <p className="text-sm font-medium text-blue-600">
            {status.summary.total}개의 매칭
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {status.summary.total}
          </div>
          <div className="text-xs text-gray-500">총 매칭 수</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {status.summary.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">대기 중</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {status.summary.accepted}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">수락됨</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {status.summary.rejected}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">거절됨</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onViewMatches}
          className="flex-1"
        >
          매칭 목록
        </Button>
        <Button
          onClick={onViewResults}
          className="flex-1"
        >
          결과 보기
        </Button>
      </div>
    </Card>
  );
};
