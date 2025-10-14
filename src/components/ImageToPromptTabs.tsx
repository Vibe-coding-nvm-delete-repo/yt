"use client";

import React, { useState } from "react";
import HistoryTab from "@/components/HistoryTab";
import ImageToPromptTab from "@/components/ImageToPromptTab";
import RatingTab from "@/components/RatingTab";

const ImageToPromptTabs: React.FC = () => {
  const [active, setActive] = useState<"generate" | "history" | "rating">(
    "generate",
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === "generate"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
          onClick={() => setActive("generate")}
        >
          Generate Prompt
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === "history"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
          onClick={() => setActive("history")}
        >
          History
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === "rating"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
          onClick={() => setActive("rating")}
        >
          Ratings
        </button>
      </div>

      {active === "generate" && <ImageToPromptTab />}
      {active === "history" && <HistoryTab />}
      {active === "rating" && <RatingTab />}
    </div>
  );
};

export default ImageToPromptTabs;
