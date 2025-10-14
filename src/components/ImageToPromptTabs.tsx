"use client";

import React, { useState } from "react";
import HistoryTab from "@/components/HistoryTab";
import ImageToPromptTab from "@/components/ImageToPromptTab";
import { useSettings } from "@/hooks/useSettings";

const ImageToPromptTabs: React.FC = () => {
  const [active, setActive] = useState<"generate" | "history">("generate");
  const { settings } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <button
          className={`px-3 py-2 ${active === "generate" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActive("generate")}
        >
          Generate Prompt
        </button>
        <button
          className={`px-3 py-2 ${active === "history" ? "border-b-2 border-blue-500" : ""}`}
          onClick={() => setActive("history")}
        >
          History
        </button>
      </div>

      {active === "generate" ? (
        <ImageToPromptTab settings={settings} />
      ) : (
        <HistoryTab />
      )}
    </div>
  );
};

export default ImageToPromptTabs;
