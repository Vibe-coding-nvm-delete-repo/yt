"use client";

import React from "react";
import type { LeonardoConfigHistoryEntry, LeonardoOutputEntry } from "@/types/leonardo";

interface HistoryOutputsTabProps {
  history: LeonardoConfigHistoryEntry[];
  outputs: LeonardoOutputEntry[];
  onLoadHistory: (entry: LeonardoConfigHistoryEntry) => void;
  onRateOutput: (id: string, rating: 1 | 2 | 3 | 4 | 5) => void;
  onDeleteHistory: (id: string) => void;
  onDeleteOutput: (id: string) => void;
}

export const HistoryOutputsTab: React.FC<HistoryOutputsTabProps> = ({
  history,
  outputs,
  onLoadHistory,
  onRateOutput,
  onDeleteHistory,
  onDeleteOutput,
}) => {
  return (
    <div className="space-y-6">
      {/* Configuration History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          Configuration History
        </h3>
        {history.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-gray-400">
            No history yet. Generate prompts to see them here.
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    {entry.presetName && (
                      <div className="font-semibold text-white">
                        {entry.presetName}
                      </div>
                    )}
                    <div className="text-sm text-gray-300 line-clamp-2">
                      {entry.generatedPrompt}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <span>Used {entry.usageCount} times</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onLoadHistory(entry)}
                      className="rounded border border-blue-500/50 px-3 py-1 text-xs text-blue-300 hover:bg-blue-500/20"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteHistory(entry.id)}
                      className="rounded border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Outputs */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Generated Outputs</h3>
        {outputs.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-gray-400">
            No outputs tracked yet.
          </div>
        ) : (
          <div className="space-y-2">
            {outputs.slice(0, 10).map((output) => (
              <div
                key={output.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="text-sm text-gray-300 line-clamp-1">
                      {output.prompt}
                    </div>
                    {output.notes && (
                      <div className="text-xs text-gray-400">
                        {output.notes}
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {/* Star Rating */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              onRateOutput(
                                output.id,
                                star as 1 | 2 | 3 | 4 | 5,
                              )
                            }
                            className={`text-lg ${
                              output.rating && output.rating >= star
                                ? "text-yellow-400"
                                : "text-gray-600"
                            } hover:text-yellow-300`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(output.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteOutput(output.id)}
                    className="rounded border border-red-500/50 px-3 py-1 text-xs text-red-300 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
