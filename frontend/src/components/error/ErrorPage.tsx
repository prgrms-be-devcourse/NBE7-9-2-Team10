'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  showRetry?: boolean;
  showHome?: boolean;
  onRetry?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  title = '문제가 발생했습니다',
  message = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  statusCode,
  showRetry = true,
  showHome = true,
  onRetry,
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const getErrorIcon = () => {
    if (statusCode === 404) return '🔍';
    if (statusCode === 403) return '🚫';
    if (statusCode === 500) return '⚠️';
    return '❌';
  };

  const getErrorMessage = () => {
    if (statusCode === 404) {
      return '요청하신 페이지를 찾을 수 없습니다.';
    }
    if (statusCode === 403) {
      return '이 페이지에 접근할 권한이 없습니다.';
    }
    if (statusCode === 500) {
      return '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
    return message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">{getErrorIcon()}</span>
          </div>
          {statusCode && (
            <div className="text-6xl font-bold text-gray-300 mb-2">
              {statusCode}
            </div>
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {showRetry && (
              <Button onClick={handleRetry} className="flex-1">
                다시 시도
              </Button>
            )}
            {showHome && (
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  홈으로 돌아가기
                </Button>
              </Link>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            문제가 계속 발생하면{' '}
            <a href="mailto:support@unimate.com" className="text-blue-600 hover:underline">
              고객지원
            </a>
            에 문의해주세요.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
