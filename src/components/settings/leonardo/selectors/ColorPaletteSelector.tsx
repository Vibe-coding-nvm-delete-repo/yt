"use client";

import React from "react";
import type { LeonardoColorPalette } from "@/types/leonardo";
import { COLOR_PALETTES } from "@/lib/leonardo/constants";

interface ColorPaletteSelectorProps {
  value: LeonardoColorPalette | undefined;
  onChange: (value: LeonardoColorPalette | undefined) => void;
  className?: string;
}

export const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-semibold text-white">
        Color Palette
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`rounded-lg border p-3 text-left transition-all ${
            !value
              ? "border-blue-500 bg-blue-500/20 text-blue-100"
              : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
          }`}
          aria-pressed={!value}
        >
          <div className="text-sm font-medium">None</div>
          <div className="mt-1 text-xs opacity-75">Natural colors</div>
        </button>

        {COLOR_PALETTES.map((palette) => {
          const isSelected = value?.name === palette.name;
          return (
            <button
              key={palette.name}
              type="button"
              onClick={() => onChange(palette)}
              className={`rounded-lg border p-3 text-left transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-500/20 text-blue-100"
                  : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
              }`}
              aria-pressed={isSelected}
            >
              <div className="text-sm font-medium">{palette.name}</div>
              <div className="mt-2 flex gap-1">
                {palette.hexColors.map((color, index) => (
                  <div
                    key={index}
                    className="h-6 w-6 rounded border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
