'use client';

import React, { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import { AppError, ErrorType, ErrorSeverity, createErrorFromException } from '../types/errors';

export interface ErrorContextState {
  errors: AppError[];
  globalError: AppError | null;
  isGlobalErrorVisible: boolean;
  errorHistory: AppError[];
  maxHistorySize: number;
}

type ErrorAction = 
  | { type: 'ADD_ERROR'; payload: AppError }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: AppError | null }
  | { type: 'CLEAR_GLOBAL_ERROR' };

export interface ErrorContextValue extends ErrorContextState {
  addError: (error: unknown, context?: string) => AppError;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: AppError | null) => void;
  clearGlobalError: () => void;
  hasErrors: boolean;
  hasCriticalErrors: boolean;
}

const initialState: ErrorContextState = {
  errors: [],
  globalError: null,
  isGlobalErrorVisible: false,
  errorHistory: [],
  maxHistorySize: 50
};

const errorReducer = (state: ErrorContextState, action: ErrorAction): ErrorContextState => {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError = action.payload;
      const updatedErrors = [...state.errors, newError];
      const updatedHistory = [...state.errorHistory, newError].slice(-state.maxHistorySize);
      
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
      return { ...state, errors: [] };

    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload,
        isGlobalErrorVisible: action.payload !== null
      };

    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null,
        isGlobalErrorVisible: false
      };

    default:
      return state;
  }
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

export interface ErrorProviderProps {
  children: ReactNode;
  maxHistorySize?: number;
  onError?: (error: AppError) => void;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  maxHistorySize = 50,
  onError
}) => {
  const [state, dispatch] = useReducer(errorReducer, {
    ...initialState,
    maxHistorySize
  });

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

    if (onError) {
      try {
        onError(appError);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }

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

  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' });
  }, []);

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
    clearGlobalError,
    hasErrors,
    hasCriticalErrors
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;