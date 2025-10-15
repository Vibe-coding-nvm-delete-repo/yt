'use client';

import React, { createContext, useContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // Duration in milliseconds, 0 = no auto-dismiss
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: ReactNode;
  defaultDuration?: number; // Default duration for toasts (ms)
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultDuration = 4000,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = {
        id,
        type,
        message,
        duration: duration ?? defaultDuration,
      };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss if duration > 0
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [defaultDuration, removeToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
