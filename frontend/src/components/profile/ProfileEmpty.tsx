'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface ProfileEmptyProps {
  onCreate: () => void;
}

const ProfileEmpty: React.FC<ProfileEmptyProps> = ({ onCreate }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <CardTitle className="text-xl">프로필이 없습니다</CardTitle>
          <CardDescription className="text-base">
            룸메이트 매칭을 위해 프로필을 만들어보세요!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">프로필을 만들면:</p>
                <ul className="space-y-1 text-left">
                  <li>• 나와 맞는 룸메이트를 찾을 수 있어요</li>
                  <li>• 선호하는 거주 지역과 예산을 설정할 수 있어요</li>
                  <li>• 매칭 서비스를 이용할 수 있어요</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button
              onClick={onCreate}
              className="flex-1 max-w-xs"
            >
              프로필 생성하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEmpty;
