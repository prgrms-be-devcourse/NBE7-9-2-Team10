import React from 'react';
import { cn } from '@/lib/utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className, message }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className={cn('relative')}>
        <div className={cn('animate-spin rounded-full border-2 border-gray-200 border-t-blue-600', sizeClasses[size])} />
        <div className={cn('absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-blue-400', sizeClasses[size])} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      {message && (
        <p className="mt-3 text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );
};

// 전체 화면 로딩 컴포넌트
interface FullScreenLoadingProps {
  message?: string;
}

export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({ 
  message = '로딩 중...' 
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 relative">
          <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-full h-full" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-blue-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-gray-600 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
