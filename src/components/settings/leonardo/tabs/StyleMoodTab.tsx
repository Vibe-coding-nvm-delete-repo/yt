"use client";

import React from "react";
import type { LeonardoImageConfig, SensoryLanguage } from "@/types/leonardo";
import { StyleSelector } from "../selectors/StyleSelector";
import { MoodSelector } from "../selectors/MoodSelector";
import { SENSORY_LANGUAGE_OPTIONS } from "@/lib/leonardo/constants";

interface StyleMoodTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
}

export const StyleMoodTab: React.FC<StyleMoodTabProps> = ({
  config,
  onChange,
}) => {
  const toggleSensory = (sensory: SensoryLanguage) => {
    const current = config.sensoryLanguage || [];
    const isSelected = current.includes(sensory);
    
    if (isSelected) {
      onChange({
        sensoryLanguage: current.filter((s) => s !== sensory),
      });
    } else {
      if (current.length >= 7) return; // Max 7
      onChange({
        sensoryLanguage: [...current, sensory],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Style Selector */}
      <StyleSelector
        value={config.style}
        onChange={(style) => onChange({ style })}
      />

      {/* Mood Descriptors */}
      <MoodSelector
        value={config.mood}
        onChange={(mood) => onChange({ mood })}
        maxSelections={5}
      />

      {/* Sensory Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-white">
            Sensory Language (Optional)
          </label>
          <span className="text-xs text-gray-400">
            {(config.sensoryLanguage || []).length} / 7 selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SENSORY_LANGUAGE_OPTIONS.map((option) => {
            const isSelected = (config.sensoryLanguage || []).includes(
              option.value,
            );
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleSensory(option.value)}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
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
    </div>
  );
};
