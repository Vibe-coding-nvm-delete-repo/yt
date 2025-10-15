'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { Toast as ToastType, ToastType as ToastTypeEnum } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const getToastIcon = (type: ToastTypeEnum) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5" aria-hidden="true" />;
    case 'error':
      return <XCircle className="h-5 w-5" aria-hidden="true" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
    case 'info':
      return <Info className="h-5 w-5" aria-hidden="true" />;
  }
};

const getToastStyles = (type: ToastTypeEnum) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-900/90',
        border: 'border-green-700',
        text: 'text-green-100',
        icon: 'text-green-400',
      };
    case 'error':
      return {
        bg: 'bg-red-900/90',
        border: 'border-red-700',
        text: 'text-red-100',
        icon: 'text-red-400',
      };
    case 'warning':
      return {
        bg: 'bg-amber-900/90',
        border: 'border-amber-700',
        text: 'text-amber-100',
        icon: 'text-amber-400',
      };
    case 'info':
      return {
        bg: 'bg-blue-900/90',
        border: 'border-blue-700',
        text: 'text-blue-100',
        icon: 'text-blue-400',
      };
  }
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const styles = getToastStyles(toast.type);

  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };

  useEffect(() => {
    // Auto-dismiss countdown for exit animation
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300); // Start exit animation 300ms before removal

      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm
        shadow-[0_24px_56px_rgba(0,0,0,0.55)]
        transition-all duration-300 ease-out
        ${styles.bg} ${styles.border} ${styles.text}
        ${
          isExiting
            ? 'opacity-0 translate-x-full'
            : 'opacity-100 translate-x-0'
        }
      `}
    >
      <div className={`flex-shrink-0 ${styles.icon}`}>
        {getToastIcon(toast.type)}
      </div>
      <div className="flex-1 text-sm font-medium pr-2">
        {toast.message}
      </div>
      <button
        onClick={handleDismiss}
        className={`
          flex-shrink-0 p-1 rounded-lg
          hover:bg-white/10 transition-colors
          focus:outline-none focus:ring-2 focus:ring-white/20
        `}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
