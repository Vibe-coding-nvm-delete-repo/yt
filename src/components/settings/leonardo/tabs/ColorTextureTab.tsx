"use client";

import React from "react";
import type { LeonardoImageConfig, SurfacePatina } from "@/types/leonardo";
import { TextureSelector } from "../selectors/TextureSelector";
import { ColorPaletteSelector } from "../selectors/ColorPaletteSelector";

interface ColorTextureTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
}

export const ColorTextureTab: React.FC<ColorTextureTabProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <ColorPaletteSelector
        value={config.colorPalette}
        onChange={(colorPalette) => {
          // With exactOptionalPropertyTypes: true, we cannot pass undefined
          // Instead, we conditionally include the property
          onChange(colorPalette !== undefined ? { colorPalette } : {});
        }}
      />

      {/* Texture */}
      <TextureSelector
        value={config.texture.dominant}
        onChange={(dominant) =>
          onChange({
            texture: { ...config.texture, dominant },
          })
        }
        secondaryTextures={config.texture.secondary || []}
        onSecondaryChange={(secondary) =>
          onChange({
            texture: { ...config.texture, secondary },
          })
        }
      />

      {/* Surface Patina */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Surface Patina
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              "pristine-new",
              "slightly-worn",
              "heavily-aged",
              "rustic-distressed",
            ] as SurfacePatina[]
          ).map((patina) => {
            const isSelected = config.texture.surfacePatina === patina;
            return (
              <button
                key={patina}
                type="button"
                onClick={() =>
                  onChange({
                    texture: { ...config.texture, surfacePatina: patina },
                  })
                }
                className={`rounded-lg border p-3 text-center text-sm capitalize transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/20 text-blue-100"
                    : "border-white/10 bg-white/5 text-gray-200 hover:border-blue-400/50"
                }`}
                aria-pressed={isSelected}
              >
                {patina.replace("-", " ")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
