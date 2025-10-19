"use client";

import React from "react";
import type { LightingSource } from "@/types/leonardo";
import { LIGHTING_SOURCES } from "@/lib/leonardo/constants";

interface LightingSelectorProps {
  value: LightingSource;
  onChange: (value: LightingSource) => void;
  secondarySources?: LightingSource[];
  onSecondaryChange?: (values: LightingSource[]) => void;
  className?: string;
}

export const LightingSelector: React.FC<LightingSelectorProps> = ({
  value,
  onChange,
  secondarySources = [],
  onSecondaryChange,
  className = "",
}) => {
  const toggleSecondary = (source: LightingSource) => {
    if (!onSecondaryChange) return;
    
    const isSelected = secondarySources.includes(source);
    if (isSelected) {
      onSecondaryChange(secondarySources.filter((s) => s !== source));
    } else {
      if (secondarySources.length >= 2) return; // Max 2 secondary
      onSecondaryChange([...secondarySources, source]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary Light Source */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Primary Light Source
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as LightingSource)}
          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          {LIGHTING_SOURCES.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#1A212A]"
            >
              {option.label} ({option.colorTemp})
            </option>
          ))}
        </select>
      </div>

      {/* Secondary Light Sources */}
      {onSecondaryChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">
              Secondary Sources (Optional)
            </label>
            <span className="text-xs text-gray-400">
              {secondarySources.length} / 2
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {LIGHTING_SOURCES.filter((opt) => opt.value !== value).map(
              (option) => {
                const isSelected = secondarySources.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSecondary(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/20 text-blue-200"
                        : "border-white/10 bg-gray-900/40 text-gray-200 hover:border-blue-400"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {option.label}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
};
