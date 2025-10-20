'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏠</span>
          </div>
          <div className="text-8xl font-bold text-blue-200 mb-4">
            404
          </div>
          <CardTitle className="text-3xl mb-4">페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription className="text-lg">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">다음 중 하나를 시도해보세요:</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• URL을 다시 확인해보세요</li>
              <li>• 홈페이지로 돌아가세요</li>
              <li>• 검색 기능을 사용해보세요</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/" className="flex-1">
              <Button className="w-full">
                🏠 홈으로 돌아가기
              </Button>
            </Link>
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full">
                👤 프로필 보기
              </Button>
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            여전히 문제가 있다면{' '}
            <a href="mailto:support@unimate.com" className="text-blue-600 hover:underline">
              고객지원팀
            </a>
            에 문의해주세요.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
