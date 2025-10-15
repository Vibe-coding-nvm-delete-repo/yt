"use client";

import React from "react";
import { useHistory } from "@/hooks/useHistory";
import { RatingWidget } from "@/components/RatingWidget";

export const HistoryTab: React.FC = () => {
  const { entries, filterModelIds, setFilterModelIds, historyModelOptions } =
    useHistory();
  const options = historyModelOptions ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Filter Models</label>
        <select
          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800"
          value={filterModelIds[0] || ""}
          onChange={(e) => {
            const value = e.target.value;
            setFilterModelIds(value ? [value] : []);
          }}
        >
          <option value="">All models in history</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.slice(0, 25).map((item) => (
          <li key={item.id} className="border rounded p-3 space-y-2">
            <a
              href={item.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={item.imageUrl}
                alt="thumbnail"
                className="w-full h-auto rounded"
              />
            </a>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {item.prompt}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
              <span>Chars: {item.charCount}/1500</span>
              <span>
                Cost: ${"{"}item.totalCost.toFixed(4){"}"}
              </span>
              <span>Model: {item.modelName}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <RatingWidget
              historyEntryId={item.id}
              modelId={item.modelId}
              modelName={item.modelName}
              imagePreview={item.imageUrl}
              prompt={item.prompt}
              compact={true}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryTab;
