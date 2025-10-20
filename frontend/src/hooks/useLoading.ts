import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export const useLoading = (initialState: boolean = false) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error, // 로딩 시작 시 에러 클리어
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false, // 에러 발생 시 로딩 중지
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
    });
  }, []);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
      clearErrorOnStart?: boolean;
    }
  ): Promise<T | null> => {
    const { onSuccess, onError, clearErrorOnStart = true } = options || {};

    try {
      setLoading(true);
      if (clearErrorOnStart) {
        clearError();
      }

      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      onError?.(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  return {
    isLoading: state.isLoading,
    error: state.error,
    setLoading,
    setError,
    clearError,
    reset,
    execute,
  };
};
