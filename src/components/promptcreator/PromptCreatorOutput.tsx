"use client";

import React from "react";

export interface OutputMetadata {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
}

export interface GenerationStep {
  label: string;
  status: "pending" | "active" | "completed" | "error";
  detail?: string;
}

export interface PromptCreatorOutputProps {
  content: string;
  copied: boolean;
  metadata?: OutputMetadata | undefined;
  generationSteps: GenerationStep[];
  showBackendProcess: boolean;
  isGenerating: boolean;
  onCopy: () => void;
  onToggleBackendProcess: (open: boolean) => void;
}

export const PromptCreatorOutput: React.FC<PromptCreatorOutputProps> = ({
  content,
  copied,
  metadata,
  generationSteps,
  showBackendProcess,
  isGenerating,
  onCopy,
  onToggleBackendProcess,
}) => {
  if (!content) return null;

  return (
    <section className="space-y-3 rounded-lg border border-green-500/40 bg-green-500/10 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-green-50">
          Generated Prompt
        </h2>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          aria-label="Copy generated prompt"
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>
      <textarea
        readOnly
        value={content}
        className="w-full h-48 p-3 rounded-md border border-green-500/30 bg-gray-900/60 text-white text-sm font-mono resize-y focus:outline-none"
      />
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-green-200">
          <span
            className={
              content.length > 1500 ? "text-red-300 font-semibold" : ""
            }
          >
            {content.length} / 1500 characters
          </span>
          {content.length > 1500 && (
            <span className="text-red-300">⚠ Exceeds limit</span>
          )}
        </div>
        {metadata && (
          <div className="flex items-center gap-4 text-green-200">
            <span>Model: {metadata.model.split("/").pop()}</span>
            <span>
              Tokens: {metadata.inputTokens} in / {metadata.outputTokens} out
            </span>
          </div>
        )}
      </div>

      {/* Backend Process Section (Collapsed) */}
      {generationSteps.length > 0 && (
        <details
          open={showBackendProcess}
          onToggle={(e) => {
            const target = e.currentTarget;
            if (target) {
              onToggleBackendProcess(target.open);
            }
          }}
          className="rounded-md border border-green-500/20 bg-gray-900/40 p-3 text-sm"
        >
          <summary className="cursor-pointer text-green-100 font-medium">
            Backend Process Steps{" "}
            {isGenerating && (
              <span className="ml-2 text-xs text-blue-300">
                (In Progress...)
              </span>
            )}
          </summary>
          <div className="mt-3 space-y-2 text-green-200">
            {generationSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <span
                  className={`flex-shrink-0 ${
                    step.status === "completed"
                      ? "text-green-400"
                      : step.status === "active"
                        ? "text-blue-400"
                        : step.status === "error"
                          ? "text-red-400"
                          : "text-gray-500"
                  }`}
                >
                  {step.status === "completed" && "✓"}
                  {step.status === "active" && "⋯"}
                  {step.status === "error" && "✗"}
                  {step.status === "pending" && "○"}
                </span>
                <div className="flex-1">
                  <span
                    className={
                      step.status === "active"
                        ? "text-blue-300 font-medium"
                        : step.status === "error"
                          ? "text-red-300"
                          : step.status === "completed"
                            ? "text-green-200"
                            : "text-gray-400"
                    }
                  >
                    {step.label}
                  </span>
                  {step.detail && (
                    <span className="ml-2 text-xs text-gray-400">
                      — {step.detail}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
};
