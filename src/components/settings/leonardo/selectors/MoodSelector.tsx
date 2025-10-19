"use client";

import React from "react";
import type { MoodDescriptor } from "@/types/leonardo";
import { MOOD_DESCRIPTORS } from "@/lib/leonardo/constants";

interface MoodSelectorProps {
  value: MoodDescriptor[];
  onChange: (value: MoodDescriptor[]) => void;
  maxSelections?: number;
  className?: string;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  value,
  onChange,
  maxSelections = 5,
  className = "",
}) => {
  const toggleMood = (mood: MoodDescriptor) => {
    const isSelected = value.includes(mood);
    if (isSelected) {
      onChange(value.filter((m) => m !== mood));
    } else {
      if (value.length >= maxSelections) {
        return; // Max selections reached
      }
      onChange([...value, mood]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-white">
          Mood Descriptors
        </label>
        <span className="text-xs text-gray-400">
          {value.length} / {maxSelections} selected
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOOD_DESCRIPTORS.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleMood(option.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-blue-200"
                  : "border-white/10 bg-gray-900/40 text-gray-200 hover:border-blue-400"
              }`}
              aria-pressed={isSelected}
              title={option.description}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
