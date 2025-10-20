import { useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils/helpers';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showToast = true,
    logError = true
  } = options;

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = getErrorMessage(error);
    
    if (logError) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }

    // TODO: Toast 알림 시스템이 있다면 여기서 사용
    if (showToast) {
      // toast.error(errorMessage);
      console.warn('Toast notification:', errorMessage);
    }

    return errorMessage;
  }, [showToast, logError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};
