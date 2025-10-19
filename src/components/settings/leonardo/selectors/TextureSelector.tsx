"use client";

import React from "react";
import type { TextureType } from "@/types/leonardo";
import { TEXTURE_SPECIFICATIONS } from "@/lib/leonardo/constants";

interface TextureSelectorProps {
  value: TextureType;
  onChange: (value: TextureType) => void;
  secondaryTextures?: TextureType[];
  onSecondaryChange?: (values: TextureType[]) => void;
  className?: string;
}

export const TextureSelector: React.FC<TextureSelectorProps> = ({
  value,
  onChange,
  secondaryTextures = [],
  onSecondaryChange,
  className = "",
}) => {
  const toggleSecondary = (texture: TextureType) => {
    if (!onSecondaryChange) return;

    const isSelected = secondaryTextures.includes(texture);
    if (isSelected) {
      onSecondaryChange(secondaryTextures.filter((t) => t !== texture));
    } else {
      if (secondaryTextures.length >= 2) return; // Max 2 secondary
      onSecondaryChange([...secondaryTextures, texture]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dominant Texture */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Dominant Texture
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TEXTURE_SPECIFICATIONS.map((option) => {
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
                title={option.tactileFeeling}
              >
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Textures */}
      {onSecondaryChange && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">
              Secondary Textures (Optional)
            </label>
            <span className="text-xs text-gray-400">
              {secondaryTextures.length} / 2
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEXTURE_SPECIFICATIONS.filter((opt) => opt.value !== value).map(
              (option) => {
                const isSelected = secondaryTextures.includes(option.value);
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
