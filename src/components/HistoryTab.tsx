"use client";

import React, { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { RatingWidget } from "@/components/RatingWidget";
import { middleEllipsis } from "@/utils/truncation";
import { Filter, History, Image as ImageIcon, DollarSign } from "lucide-react";
import Image from "next/image";

export const HistoryTab: React.FC = () => {
  const { entries, filterModelIds, setFilterModelIds, historyModelOptions } =
    useHistory();
  const options = historyModelOptions ?? [];
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <History className="h-6 w-6" /> History
      </h1>

      {/* Filter */}
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-300">
          <Filter className="h-4 w-4" /> Filter
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Model:</label>
          <select
            className="flex-1 bg-white/5 border-none rounded-lg px-3 py-2 text-sm text-white focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-colors"
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
      </div>

      {/* History List */}
      <div className="bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] divide-y divide-white/6">
        {entries.length === 0 && (
          <div className="p-6 text-sm text-gray-400">
            No history yet. Generate prompts to see entries here.
          </div>
        )}
        {entries.slice(0, 25).map((item) => {
          const isExpanded = expandedIds.has(item.id);
          const shouldTruncate = item.prompt.length > 150;

          return (
            <div key={item.id} className="p-4 flex items-start gap-4">
              {/* Image Preview */}
              <a
                href={item.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-24 h-24 rounded border border-white/10 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                title="Click to view full image"
              >
                <Image
                  src={item.imageUrl}
                  alt="History entry"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </a>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-2">
                {/* Prompt - Truncated or Full */}
                <div className="text-sm text-gray-300">
                  {shouldTruncate && !isExpanded ? (
                    <>
                      {item.prompt.slice(0, 150)}...{" "}
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Show more
                      </button>
                    </>
                  ) : (
                    <>
                      {item.prompt}
                      {shouldTruncate && (
                        <>
                          {" "}
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Show less
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span title={item.modelName}>
                    {middleEllipsis(item.modelName, 30)}
                  </span>
                  <span>•</span>
                  <span>{item.charCount} chars</span>
                  <span>•</span>
                  <span className="text-green-400">
                    ${item.totalCost.toFixed(6)}
                  </span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>

                {/* Rating Widget */}
                <RatingWidget
                  historyEntryId={item.id}
                  modelId={item.modelId}
                  modelName={item.modelName}
                  imagePreview={item.imageUrl}
                  prompt={item.prompt}
                  compact={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTab;
