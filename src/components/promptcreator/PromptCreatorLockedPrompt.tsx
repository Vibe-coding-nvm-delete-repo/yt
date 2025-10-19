"use client";

import React from "react";

export interface PromptCreatorLockedPromptProps {
  lockedInPrompt: string;
  isLocked: boolean;
  onLockedPromptChange: (value: string) => void;
  onToggleLock: () => void;
}

export const PromptCreatorLockedPrompt: React.FC<
  PromptCreatorLockedPromptProps
> = ({ lockedInPrompt, isLocked, onLockedPromptChange, onToggleLock }) => (
  <section className="space-y-2 rounded-lg border border-white/5 bg-gray-900/30 p-4">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-100">
        Locked Prompt (combined with field selections)
      </label>
      <button
        type="button"
        onClick={onToggleLock}
        className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-1 text-xs text-gray-200 hover:border-blue-400 transition-colors"
      >
        {isLocked ? (
          <>
            <span>🔒</span>
            <span>Unlock to Edit</span>
          </>
        ) : (
          <>
            <span>🔓</span>
            <span>Lock</span>
          </>
        )}
      </button>
    </div>
    <textarea
      value={lockedInPrompt}
      onChange={(e) => onLockedPromptChange(e.target.value)}
      disabled={isLocked}
      rows={6}
      className={`w-full rounded-md border border-white/10 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-mono ${
        isLocked
          ? "bg-gray-900/80 cursor-not-allowed opacity-70"
          : "bg-gray-900/60"
      }`}
      placeholder="Enter base prompt that will be combined with field selections..."
    />
  </section>
);
