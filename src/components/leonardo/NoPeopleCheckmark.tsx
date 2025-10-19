"use client";

import React, { useState, useEffect } from "react";

interface NoPeopleCheckmarkProps {
  isValid: boolean;
  className?: string;
}

export const NoPeopleCheckmark: React.FC<NoPeopleCheckmarkProps> = ({
  isValid,
  className = "",
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isValid) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isValid]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
          isValid
            ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/50"
            : "bg-gray-500/20 text-gray-500"
        } ${animate ? "scale-110" : "scale-100"}`}
      >
        {isValid ? (
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
      <div>
        <div className={`font-semibold ${isValid ? "text-green-400" : "text-gray-400"}`}>
          {isValid ? "✓ No People Detected" : "Checking..."}
        </div>
        <div className="text-xs text-gray-400">
          {isValid
            ? "Prompt is safe for YouTube content"
            : "Validating for human elements"}
        </div>
      </div>
    </div>
  );
};
