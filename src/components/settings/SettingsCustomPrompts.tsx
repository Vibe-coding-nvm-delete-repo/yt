"use client";

import React from "react";

export interface SettingsCustomPromptsProps {
  customPrompt: string;
  onCustomPromptChange: (value: string) => void;
}

export const SettingsCustomPrompts: React.FC<SettingsCustomPromptsProps> = ({
  customPrompt,
  onCustomPromptChange,
}) => (
  <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] space-y-4">
    <h3 className="text-lg font-semibold text-white">
      Custom Prompt Templates
    </h3>
    <textarea
      value={customPrompt}
      onChange={(e) => onCustomPromptChange(e.target.value)}
      rows={4}
      placeholder="Enter your custom prompt template..."
      className="w-full px-4 py-2 border-none rounded-lg focus:ring-2 focus:ring-blue-500/50 bg-white/5 focus:bg-white/10 text-white placeholder:text-gray-500 resize-none transition-colors"
    />
    <p className="text-sm text-gray-400">
      This prompt will be used when generating prompts from images. Changes are
      saved automatically.
    </p>
  </div>
);
