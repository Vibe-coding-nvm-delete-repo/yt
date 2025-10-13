'use client';

import React, { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import { AppError, ErrorType, ErrorSeverity, createErrorFromException } from '../types/errors';

// Error Context State
export interface ErrorContextState {
  errors: AppError[];
  globalError: AppError | null;
  isGlobalErrorVisible: boolean;
  errorHistory: AppError[];
  maxHistorySize: number;
}

// Error Context Actions
type ErrorAction = 
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null }
  | { type: 'SHOW_GLOBAL_ERROR' }
  | { type: 'HIDE_GLOBAL_ERROR' }
  | { type: 'CLEAR_GLOBAL_ERROR' }
  | { type: 'CLEAR_HISTORY' };

// Error Context Value
export interface ErrorContextValue extends ErrorContextState {
  addError: (error: unknown, context?: string) => AppError;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: AppError | null) => void;
  showGlobalError: () => void;
  hideGlobalError: () => void;
  clearGlobalError: () => void;
  clearHistory: () => void;
  hasErrors: boolean;
  hasCriticalErrors: boolean;
  getErrorsByType: (type: ErrorType) => AppError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
}

// Initial state
const initialState: ErrorContextState = {
  errors: [],
  globalError: null,
  isGlobalErrorVisible: false,
  errorHistory: [],
  maxHistorySize: 50
};

// Error reducer
const errorReducer = (state: ErrorContextState, action: ErrorAction): ErrorContextState => {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError = action.payload;
      const updatedErrors = [...state.errors, newError];
      const updatedHistory = [...state.errorHistory, newError].slice(-state.maxHistorySize);
      
      // Auto-set as global error if critical
      const shouldSetGlobal = newError.severity === ErrorSeverity.CRITICAL && !state.globalError;
      
      return {
        ...state,
        errors: updatedErrors,
        errorHistory: updatedHistory,
        globalError: shouldSetGlobal ? newError : state.globalError,
        isGlobalErrorVisible: shouldSetGlobal || state.isGlobalErrorVisible
      };
    }

    case 'REMOVE_ERROR': {
      const errorId = action.payload;
      const updatedErrors = state.errors.filter(error => 
        error.context.errorId !== errorId
      );
      
      // Clear global error if it was removed
      const globalError = state.globalError?.context.errorId === errorId 
        ? null 
        : state.globalError;
        
      return {
        ...state,
        errors: updatedErrors,
        globalError,
        isGlobalErrorVisible: globalError ? state.isGlobalErrorVisible : false
      };
    }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
        isGlobalErrorVisible: action.payload !== null
      };

    case 'SHOW_GLOBAL_ERROR':
      return {
        ...state,
        isGlobalErrorVisible: true
      };

    case 'HIDE_GLOBAL_ERROR':
      return {
        ...state,
        isGlobalErrorVisible: false
      };

    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null,
        isGlobalErrorVisible: false
      };

    case 'CLEAR_HISTORY':
      return {
        ...state,
        errorHistory: []
      };

    default:
      return state;
  }
};

// Create context
const ErrorContext = createContext<ErrorContextValue | null>(null);

// Error Provider Props
export interface ErrorProviderProps {
  children: ReactNode;
  maxHistorySize?: number;
  onError?: (error: AppError) => void;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
}

// Error Provider Component
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxHistorySize = 50,
  onError,
  enableAutoCleanup = true,
  cleanupInterval = 30000
}) => {
  const [state, dispatch] = useReducer(errorReducer, {
    ...initialState,
    maxHistorySize
  });

  // Auto cleanup old errors
  React.useEffect(() => {
    if (!enableAutoCleanup) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      const activeErrors = state.errors.filter(error => 
        now - error.context.timestamp < maxAge
      );
      
      if (activeErrors.length !== state.errors.length) {
        dispatch({ type: 'CLEAR_ERRORS' });
        activeErrors.forEach(error => {
          dispatch({ type: 'ADD_ERROR', payload: error });
        });
      }
    }, cleanupInterval);

    return () => clearInterval(cleanup);
  }, [state.errors, enableAutoCleanup, cleanupInterval]);

  const addError = useCallback((error: unknown, context?: string): AppError => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = createErrorFromException(error, {
        component: context || 'ErrorProvider',
        operation: 'addError',
        errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }

    // Ensure error has an ID
    if (!appError.context.errorId) {
      appError = new AppError(
        appError.type,
        appError.message,
        appError.userMessage,
        {
          ...appError,
          context: {
            ...appError.context,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        }
      );
    }

    dispatch({ type: 'ADD_ERROR', payload: appError });

    // Call external error handler
    if (onError) {
      try {
        onError(appError);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }

    // Log error for debugging
    console.error('Error added to context:', appError.toJSON());

    return appError;
  }, [onError]);

  const removeError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: errorId });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const setGlobalError = useCallback((error: AppError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);

  const showGlobalError = useCallback(() => {
    dispatch({ type: 'SHOW_GLOBAL_ERROR' });
  }, []);

  const hideGlobalError = useCallback(() => {
    dispatch({ type: 'HIDE_GLOBAL_ERROR' });
  }, []);

  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const getErrorsByType = useCallback((type: ErrorType): AppError[] => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  const getErrorsBySeverity = useCallback((severity: ErrorSeverity): AppError[] => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  const hasErrors = state.errors.length > 0;
  const hasCriticalErrors = state.errors.some(error => 
    error.severity === ErrorSeverity.CRITICAL
  );

  const contextValue: ErrorContextValue = {
    ...state,
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    showGlobalError,
    hideGlobalError,
    clearGlobalError,
    clearHistory,
    hasErrors,
    hasCriticalErrors,
    getErrorsByType,
    getErrorsBySeverity
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook to use error context
export const useErrorContext = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;