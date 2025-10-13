'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppError, ErrorSeverity, ErrorType } from '../types/errors';
import { useErrorContext } from '../contexts/ErrorContext';

export interface NotificationProps {
  error: AppError;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHideDelay?: number;
  showRetryButton?: boolean;
  compact?: boolean;
}

export const ErrorNotification: React.FC<NotificationProps> = ({
  error,
  onDismiss,
  onRetry,
  autoHideDelay = 5000,
  showRetryButton = true,
  compact = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoHideDelay > 0 && error.severity !== ErrorSeverity.CRITICAL) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHideDelay, error.severity]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 200);
  }, [onDismiss]);

  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
      handleDismiss();
    }
  }, [onRetry, handleDismiss]);

  const getNotificationStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s ease-in-out',
      transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible && !isExiting ? 1 : 0,
      marginBottom: '0.5rem',
      padding: compact ? '0.5rem' : '1rem',
      borderRadius: '8px',
      border: '1px solid',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      maxWidth: '400px',
      fontFamily: 'system-ui, sans-serif',
      fontSize: compact ? '0.8rem' : '0.9rem',
      lineHeight: '1.4'
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return {
          ...baseStyles,
          backgroundColor: '#fee2e2',
          borderColor: '#ef4444',
          color: '#dc2626'
        };
      case ErrorSeverity.HIGH:
        return {
          ...baseStyles,
          backgroundColor: '#fef3c7',
          borderColor: '#f59e0b',
          color: '#d97706'
        };
      case ErrorSeverity.MEDIUM:
        return {
          ...baseStyles,
          backgroundColor: '#dbeafe',
          borderColor: '#3b82f6',
          color: '#2563eb'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#f3f4f6',
          borderColor: '#6b7280',
          color: '#374151'
        };
    }
  };

  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL: return '🚨';
      case ErrorSeverity.HIGH: return '⚠️';
      case ErrorSeverity.MEDIUM: return '⚡';
      case ErrorSeverity.LOW: return 'ℹ️';
      default: return '❌';
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case ErrorType.NETWORK: return 'Connection Issue';
      case ErrorType.API: return 'Service Error';
      case ErrorType.AUTHENTICATION: return 'Authentication Required';
      case ErrorType.PERMISSION: return 'Access Denied';
      case ErrorType.RATE_LIMIT: return 'Rate Limited';
      case ErrorType.VALIDATION: return 'Validation Error';
      case ErrorType.STORAGE: return 'Storage Error';
      case ErrorType.TIMEOUT: return 'Request Timeout';
      default: return 'Error';
    }
  };

  return (
    <div style={getNotificationStyles()} role="alert">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: compact ? '0.25rem' : '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: compact ? '1rem' : '1.2rem' }}>
            {getIcon()}
          </span>
          <h4 style={{ margin: 0, fontSize: compact ? '0.8rem' : '0.9rem', fontWeight: '600' }}>
            {getTitle()}
          </h4>
        </div>
        
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            opacity: 0.7,
            padding: '0.2rem'
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>

      <p style={{ margin: 0, marginBottom: compact ? '0.5rem' : '0.75rem' }}>
        {error.userMessage}
      </p>

      {(showRetryButton && error.retryable) && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleRetry}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Retry
          </button>
          
          {error.context.retryCount && error.context.retryCount > 0 && (
            <span style={{ 
              fontSize: '0.7rem', 
              opacity: 0.7, 
              alignSelf: 'center',
              fontStyle: 'italic'
            }}>
              Attempt {error.context.retryCount + 1}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const ErrorNotificationContainer: React.FC<{
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
}> = ({ position = 'top-right', maxNotifications = 5 }) => {
  const { errors, removeError } = useErrorContext();
  const visibleErrors = errors.slice(-maxNotifications);

  const getContainerStyles = () => {
    const positions = {
      'top-right': { top: '1rem', right: '1rem' },
      'top-left': { top: '1rem', left: '1rem' },
      'bottom-right': { bottom: '1rem', right: '1rem' },
      'bottom-left': { bottom: '1rem', left: '1rem' }
    };

    return {
      position: 'fixed' as const,
      ...positions[position],
      zIndex: 9999,
      pointerEvents: 'none' as const
    };
  };

  return (
    <div style={getContainerStyles()}>
      {visibleErrors.map((error) => (
        <div key={error.context.errorId} style={{ pointerEvents: 'auto' }}>
          <ErrorNotification
            error={error}
            onDismiss={() => removeError(error.context.errorId!)}
            showRetryButton={error.retryable}
          />
        </div>
      ))}
    </div>
  );
};

export default ErrorNotification;