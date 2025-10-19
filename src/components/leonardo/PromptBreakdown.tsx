"use client";

import React from "react";
import type { PromptSection } from "@/types/leonardo";

interface PromptBreakdownProps {
  sections: PromptSection[];
  className?: string;
}

export const PromptBreakdown: React.FC<PromptBreakdownProps> = ({
  sections,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-white">5-Step Prompt Breakdown</h3>
      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.step}
            className="rounded-lg border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">
                {section.step}
              </div>
              <div className="flex-1 space-y-2">
                <div className="font-semibold text-white">{section.label}</div>
                <div className="text-sm text-gray-300">{section.content}</div>
                <div className="text-xs text-gray-400">{section.explanation}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
