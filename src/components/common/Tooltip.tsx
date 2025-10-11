'use client';

import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';

export const sanitizeTooltipId = (value: string): string => {
  return `${value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'tooltip'}-info`;
};

interface TooltipProps {
  /**
   * Unique identifier for aria relationships. Spaces and special characters are sanitized.
   */
  id: string;
  /**
   * Accessible label describing the info button.
   */
  label: string;
  /**
   * Tooltip body text.
   */
  message: string;
  /**
   * Optional additional class names for the wrapper.
   */
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ id, label, message, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useMemo(() => sanitizeTooltipId(id), [id]);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);

  return (
    <div className={`relative inline-block ${className ?? ''}`}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={isOpen ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            hide();
          }
        }}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 z-10 mt-2 max-w-xs -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700"
        >
          {message}
        </div>
      )}
    </div>
  );
};
