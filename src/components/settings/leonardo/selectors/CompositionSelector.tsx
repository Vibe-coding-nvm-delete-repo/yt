"use client";

import React from "react";
import type { CompositionTechnique } from "@/types/leonardo";
import { COMPOSITION_TECHNIQUES } from "@/lib/leonardo/constants";

interface CompositionSelectorProps {
  value: CompositionTechnique;
  onChange: (value: CompositionTechnique) => void;
  className?: string;
}

export const CompositionSelector: React.FC<CompositionSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-white">
        Composition Technique
      </label>
      <div className="grid grid-cols-2 gap-2">
        {COMPOSITION_TECHNIQUES.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-blue-100"
                  : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
              }`}
              aria-pressed={isSelected}
              title={option.visualizationHint}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="mt-1 text-xs opacity-75">
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
