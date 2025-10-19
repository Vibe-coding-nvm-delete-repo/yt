"use client";

import React from "react";
import type {
  LeonardoImageConfig,
  LightDirection,
  ExposureMood,
  LightQuality,
} from "@/types/leonardo";
import { LightingSelector } from "../selectors/LightingSelector";

interface LightingTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
}

export const LightingTab: React.FC<LightingTabProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Primary and Secondary Lights */}
      <LightingSelector
        value={config.lighting.primarySource}
        onChange={(primarySource) =>
          onChange({
            lighting: { ...config.lighting, primarySource },
          })
        }
        secondarySources={config.lighting.secondarySources || []}
        onSecondaryChange={(secondarySources) =>
          onChange({
            lighting: { ...config.lighting, secondarySources },
          })
        }
      />

      {/* Light Direction */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Light Direction
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              "front",
              "side",
              "back",
              "top",
              "bottom",
              "three-quarter",
            ] as LightDirection[]
          ).map((direction) => {
            const isSelected = config.lighting.direction === direction;
            return (
              <button
                key={direction}
                type="button"
                onClick={() =>
                  onChange({
                    lighting: { ...config.lighting, direction },
                  })
                }
                className={`rounded-lg border p-3 text-center text-sm capitalize transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/20 text-blue-100"
                    : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                }`}
                aria-pressed={isSelected}
              >
                {direction}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Temperature */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Color Temperature: {config.lighting.colorTemperature}K
        </label>
        <input
          type="range"
          min="2400"
          max="5000"
          step="100"
          value={config.lighting.colorTemperature}
          onChange={(e) =>
            onChange({
              lighting: {
                ...config.lighting,
                colorTemperature: Number(e.target.value),
              },
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Warm (2400K)</span>
          <span>Cool (5000K)</span>
        </div>
      </div>

      {/* Exposure Mood */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Exposure Mood
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              "bright-airy",
              "dark-moody",
              "high-contrast",
              "low-contrast",
              "balanced",
            ] as ExposureMood[]
          ).map((mood) => {
            const isSelected = config.lighting.exposureMood === mood;
            return (
              <button
                key={mood}
                type="button"
                onClick={() =>
                  onChange({
                    lighting: { ...config.lighting, exposureMood: mood },
                  })
                }
                className={`rounded-lg border p-3 text-center text-xs capitalize transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/20 text-blue-100"
                    : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                }`}
                aria-pressed={isSelected}
              >
                {mood.replace("-", " ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Light Quality */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Light Quality
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["hard", "soft", "diffused"] as LightQuality[]).map((quality) => {
            const isSelected = config.lighting.quality === quality;
            return (
              <button
                key={quality}
                type="button"
                onClick={() =>
                  onChange({
                    lighting: { ...config.lighting, quality },
                  })
                }
                className={`rounded-lg border p-3 text-center text-sm capitalize transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/20 text-blue-100"
                    : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                }`}
                aria-pressed={isSelected}
              >
                {quality}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
