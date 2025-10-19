"use client";

import React, { useState } from "react";
import type { LeonardoImageConfig, GeneratedPrompt } from "@/types/leonardo";
import { generateFullPrompt } from "@/lib/leonardo/prompt-builder";
import { validateFullPrompt } from "@/lib/leonardo/validation";
import { PromptBreakdown } from "@/components/leonardo/PromptBreakdown";
import { NoPeopleCheckmark } from "@/components/leonardo/NoPeopleCheckmark";
import { SubjectSelector } from "../selectors/SubjectSelector";

interface PreviewExportTabProps {
  config: LeonardoImageConfig;
  onChange: (updates: Partial<LeonardoImageConfig>) => void;
  onSavePreset: (name: string) => void;
  onExport: () => void;
  onImport: (data: string) => void;
}

export const PreviewExportTab: React.FC<PreviewExportTabProps> = ({
  config,
  onChange,
  onSavePreset,
  onExport,
  onImport,
}) => {
  const [generatedPrompt, setGeneratedPrompt] = useState<GeneratedPrompt | null>(
    null,
  );
  const [presetName, setPresetName] = useState("");
  const [importText, setImportText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const result = generateFullPrompt(config);
    setGeneratedPrompt(result);
  };

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt.fullPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const validation = validateFullPrompt(
    generatedPrompt?.fullPrompt || "",
  );

  return (
    <div className="space-y-6">
      {/* Subject Selector (for quick access) */}
      <SubjectSelector
        value={config.subject}
        onChange={(subject) => onChange({ subject })}
      />

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Generate Prompt Preview
      </button>

      {/* No People Validation */}
      {generatedPrompt && (
        <NoPeopleCheckmark
          isValid={generatedPrompt.metadata.noPeopleValidated}
        />
      )}

      {/* Prompt Breakdown */}
      {generatedPrompt && (
        <PromptBreakdown sections={generatedPrompt.sections} />
      )}

      {/* Final Prompt */}
      {generatedPrompt && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Final Prompt</h3>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={generatedPrompt.fullPrompt}
            rows={6}
            className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 font-mono text-sm text-white focus:outline-none"
          />
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              {generatedPrompt.metadata.characterCount} / 1500 characters
            </span>
            {!validation.isValid && (
              <span className="text-red-400">
                {validation.errors.length} error(s)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Negative Prompt */}
      {generatedPrompt && generatedPrompt.negativePrompt && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white">Negative Prompt</h3>
          <textarea
            readOnly
            value={generatedPrompt.negativePrompt}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-3 font-mono text-sm text-white focus:outline-none"
          />
        </div>
      )}

      {/* Save as Preset */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Save as Preset
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name"
            className="flex-1 rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (presetName.trim()) {
                onSavePreset(presetName);
                setPresetName("");
              }
            }}
            disabled={!presetName.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      {/* Export/Import */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Export Configuration
          </label>
          <button
            type="button"
            onClick={onExport}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
          >
            Export to Clipboard (JSON)
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-white">
            Import Configuration
          </label>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste JSON configuration here..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (importText.trim()) {
                onImport(importText);
                setImportText("");
              }
            }}
            disabled={!importText.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};
