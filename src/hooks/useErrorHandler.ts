'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppError, ErrorType, createErrorFromException, isRetryableError } from '../types/errors';
import { retryAsync, RetryOptions } from '../utils/retry';

export interface ErrorState {
  error: AppError | null;
  isError: boolean;
  isRetrying: boolean;
  retryCount: number;
  errorHistory: AppError[];
}

export interface UseErrorHandlerOptions {
  maxRetryCount?: number;
  defaultRetryOptions?: RetryOptions;
  onError?: (error: AppError) => void;
  onRetry?: (error: AppError, attempt: number) => void;
  onRecovery?: (error: AppError) => void;
  reportErrors?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    maxRetryCount = 3,
    defaultRetryOptions,
    onError,
    onRetry,
    onRecovery,
    reportErrors = true
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    isRetrying: false,
    retryCount: 0,
    errorHistory: []
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const reportError = useCallback((error: AppError) => {
    if (!reportErrors) return;
    console.error('Error handled:', error.toJSON());
  }, [reportErrors]);

  const handleError = useCallback((error: unknown, context?: string) => {
    const appError = createErrorFromException(error, {
      component: context,
      operation: 'handleError'
    });

    setErrorState(prevState => ({
      error: appError,
      isError: true,
      isRetrying: false,
      retryCount: prevState.retryCount,
      errorHistory: [...prevState.errorHistory, appError].slice(-10)
    }));

    reportError(appError);
    
    if (onError) {
      onError(appError);
    }

    return appError;
  }, [onError, reportError]);

  const clearError = useCallback(() => {
    setErrorState(prevState => ({
      error: null,
      isError: false,
      isRetrying: false,
      retryCount: 0,
      errorHistory: prevState.errorHistory
    }));
  }, []);

  const retry = useCallback(async (
    retryFn: () => Promise<void>,
    retryOptions?: RetryOptions
  ) => {
    if (!errorState.error?.retryable) {
      console.warn('Attempted to retry non-retryable error');
      return;
    }

    if (errorState.retryCount >= maxRetryCount) {
      console.warn('Max retry count reached');
      return;
    }

    setErrorState(prevState => ({
      ...prevState,
      isRetrying: true,
      retryCount: prevState.retryCount + 1
    }));

    try {
      if (onRetry) {
        onRetry(errorState.error, errorState.retryCount + 1);
      }

      await retryAsync(retryFn, {
        ...defaultRetryOptions,
        ...retryOptions
      });

      if (onRecovery && errorState.error) {
        onRecovery(errorState.error);
      }
      
      clearError();
    } catch (error) {
      const retryError = createErrorFromException(error, {
        component: 'useErrorHandler',
        operation: 'retry',
        retryCount: errorState.retryCount + 1
      });

      setErrorState(prevState => ({
        error: retryError,
        isError: true,
        isRetrying: false,
        retryCount: prevState.retryCount + 1,
        errorHistory: [...prevState.errorHistory, retryError].slice(-10)
      }));

      reportError(retryError);
    }
  }, [
    errorState.error,
    errorState.retryCount,
    maxRetryCount,
    defaultRetryOptions,
    onRetry,
    onRecovery,
    clearError,
    reportError
  ]);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    retryOptions?: RetryOptions
  ): Promise<T> => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const result = await retryAsync(asyncFn, {
        ...defaultRetryOptions,
        ...retryOptions,
        signal: abortControllerRef.current.signal
      });

      return result.result;
    } catch (error) {
      throw handleError(error, context);
    }
  }, [defaultRetryOptions, handleError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    errorHistory: errorState.errorHistory,
    canRetry: errorState.error?.retryable && errorState.retryCount < maxRetryCount,
    handleError,
    clearError,
    retry,
    executeWithErrorHandling
  };
};

export default useErrorHandler;