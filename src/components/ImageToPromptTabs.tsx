"use client";

import React, { useState } from "react";
import HistoryTab from "@/components/HistoryTab";
import ImageToPromptTab from "@/components/ImageToPromptTab";
import RatingTab from "@/components/RatingTab";
import { useSettings } from "@/hooks/useSettings";

const ImageToPromptTabs: React.FC = () => {
  const [active, setActive] = useState<"generate" | "history" | "rating">(
    "generate",
  );
  const { settings } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-white/10">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === "generate"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActive("generate")}
        >
          Generate Prompt
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === "history"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActive("history")}
        >
          History
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            active === "rating"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
          onClick={() => setActive("rating")}
        >
          Ratings
        </button>
      </div>

      {active === "generate" && <ImageToPromptTab settings={settings} />}
      {active === "history" && <HistoryTab />}
      {active === "rating" && <RatingTab />}
    </div>
  );
};

export default ImageToPromptTabs;
