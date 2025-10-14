"use client";

import React, { useMemo } from "react";
import { useHistory } from "@/hooks/useHistory";
import { useSettings } from "@/hooks/useSettings";

export const HistoryTab: React.FC = () => {
  const { entries, filterModelIds, setFilterModelIds } = useHistory();
  const { settings } = useSettings(["availableModels"]);

  const modelOptions = useMemo(
    () => settings.availableModels.map((m) => ({ id: m.id, name: m.name })),
    [settings.availableModels],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label className="text-sm">Filter models:</label>
        <div className="inline-flex flex-wrap gap-2">
          {modelOptions.map((opt) => (
            <label
              key={opt.id}
              className="inline-flex items-center gap-1 text-sm"
            >
              <input
                type="checkbox"
                checked={filterModelIds.includes(opt.id)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...filterModelIds, opt.id]
                    : filterModelIds.filter((id) => id !== opt.id);
                  setFilterModelIds(next);
                }}
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
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
            <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {item.prompt}
            </div>
            <div className="text-xs text-gray-500 flex flex-wrap gap-3">
              <span>Chars: {item.charCount}/1500</span>
              <span>
                Cost: ${"{"}item.totalCost.toFixed(4){"}"}
              </span>
              <span>Model: {item.modelName}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryTab;
