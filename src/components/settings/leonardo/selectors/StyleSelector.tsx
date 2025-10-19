"use client";

import React from "react";
import type { LeonardoStyle } from "@/types/leonardo";
import { STYLE_OPTIONS } from "@/lib/leonardo/constants";

interface StyleSelectorProps {
  value: LeonardoStyle;
  onChange: (value: LeonardoStyle) => void;
  className?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-white">
        Art Style
      </label>
      <div className="grid grid-cols-2 gap-3">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 ring-2 ring-blue-500/50"
                  : "border-white/10 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"
              }`}
              aria-pressed={isSelected}
            >
              <div className="font-semibold text-white">{option.label}</div>
              <div className="mt-1 text-xs text-gray-400">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
