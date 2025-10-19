"use client";

import React from "react";
import type {
  LeonardoImageConfig,
  DepthOfField,
  FocusPriority,
  Resolution,
  AspectRatio,
} from "@/types/leonardo";

interface AdvancedTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Depth of Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Depth of Field
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(["f/2.8", "f/5.6", "f/11", "deep-focus"] as DepthOfField[]).map(
            (dof) => {
              const isSelected = config.technical.depthOfField === dof;
              return (
                <button
                  key={dof}
                  type="button"
                  onClick={() =>
                    onChange({
                      technical: { ...config.technical, depthOfField: dof },
                    })
                  }
                  className={`rounded-lg border p-3 text-center text-sm transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {dof}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Focus Priority */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Focus Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["foreground", "midground", "background"] as FocusPriority[]).map(
            (priority) => {
              const isSelected = config.technical.focusPriority === priority;
              return (
                <button
                  key={priority}
                  type="button"
                  onClick={() =>
                    onChange({
                      technical: { ...config.technical, focusPriority: priority },
                    })
                  }
                  className={`rounded-lg border p-3 text-center text-sm capitalize transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {priority}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Special Effects */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-white">
          Special Effects
        </label>
        <div className="space-y-2">
          {[
            { key: "filmGrain", label: "Film Grain" },
            { key: "lensFlare", label: "Lens Flare" },
            { key: "vignetting", label: "Vignetting" },
          ].map((effect) => (
            <label
              key={effect.key}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <input
                type="checkbox"
                checked={
                  config.technical[effect.key as keyof typeof config.technical] as boolean
                }
                onChange={(e) =>
                  onChange({
                    technical: {
                      ...config.technical,
                      [effect.key]: e.target.checked,
                    },
                  })
                }
                className="h-5 w-5 rounded border-white/10 bg-gray-900 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <span className="text-sm text-white">{effect.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Resolution
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(["4k", "1080p", "cinema-2k", "square-1024"] as Resolution[]).map(
            (res) => {
              const isSelected = config.technical.resolution === res;
              return (
                <button
                  key={res}
                  type="button"
                  onClick={() =>
                    onChange({
                      technical: { ...config.technical, resolution: res },
                    })
                  }
                  className={`rounded-lg border p-3 text-center text-xs transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {res}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-5 gap-2">
          {(["16:9", "1:1", "9:16", "21:9", "4:3"] as AspectRatio[]).map(
            (ratio) => {
              const isSelected = config.technical.aspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() =>
                    onChange({
                      technical: { ...config.technical, aspectRatio: ratio },
                    })
                  }
                  className={`rounded-lg border p-3 text-center text-sm transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {ratio}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Video Metadata */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Video Duration (optional)
        </label>
        <input
          type="number"
          min="1"
          max="3600"
          value={config.videoMetadata?.duration || ""}
          onChange={(e) =>
            onChange({
              videoMetadata: {
                ...config.videoMetadata,
                duration: Number(e.target.value) || undefined,
              },
            })
          }
          placeholder="Duration in seconds"
          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        />
        <p className="text-xs text-gray-400">
          Leave empty for static images
        </p>
      </div>
    </div>
  );
};
