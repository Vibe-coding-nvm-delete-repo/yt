"use client";

import React from "react";
import type { LeonardoImageConfig, FocalPoint, VisualFlow } from "@/types/leonardo";
import { CompositionSelector } from "../selectors/CompositionSelector";
import { FOCAL_POINT_OPTIONS } from "@/lib/leonardo/constants";

interface CompositionTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
}

export const CompositionTab: React.FC<CompositionTabProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Composition Technique */}
      <CompositionSelector
        value={config.composition.technique}
        onChange={(technique) =>
          onChange({
            composition: { ...config.composition, technique },
          })
        }
      />

      {/* Focal Point */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Focal Point
        </label>
        <select
          value={config.composition.focalPoint}
          onChange={(e) =>
            onChange({
              composition: {
                ...config.composition,
                focalPoint: e.target.value as FocalPoint,
              },
            })
          }
          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
        >
          {FOCAL_POINT_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[#1A212A]"
            >
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          {
            FOCAL_POINT_OPTIONS.find(
              (opt) => opt.value === config.composition.focalPoint,
            )?.description
          }
        </p>
      </div>

      {/* Visual Flow */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Visual Flow
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(["horizontal", "vertical", "circular", "diagonal"] as VisualFlow[]).map(
            (flow) => {
              const isSelected = config.composition.visualFlow === flow;
              return (
                <button
                  key={flow}
                  type="button"
                  onClick={() =>
                    onChange({
                      composition: {
                        ...config.composition,
                        visualFlow: flow,
                      },
                    })
                  }
                  className={`rounded-lg border p-3 text-center text-sm capitalize transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/20 text-blue-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                  }`}
                  aria-pressed={isSelected}
                >
                  {flow}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Negative Space Ratio */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Negative Space Ratio: {config.composition.negativeSpaceRatio}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={config.composition.negativeSpaceRatio}
          onChange={(e) =>
            onChange({
              composition: {
                ...config.composition,
                negativeSpaceRatio: Number(e.target.value),
              },
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Minimal (0%)</span>
          <span>Generous (100%)</span>
        </div>
      </div>
    </div>
  );
};
