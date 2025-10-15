"use client";

import React, { useMemo, useState } from "react";
import { usageStorage } from "@/lib/usage";
import type { UsageEntry } from "@/types/usage";
import {
  Calendar,
  DollarSign,
  Filter,
  List,
  SlidersHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { middleEllipsis } from "@/utils/truncation";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UsageTabProps {}

const formatCurrency = (n: number) => {
  // Show user-friendly format: 2 decimal places for amounts >= $0.01
  // Otherwise show up to 6 decimals for very small amounts
  if (n >= 0.01) {
    return `$${n.toFixed(2)}`;
  }
  return `$${n.toFixed(6)}`;
};

export const UsageTab: React.FC<UsageTabProps> = () => {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [modelFilter, setModelFilter] = useState<string>("");

  // Disable React Compiler for this component due to manual memoization
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const list = useMemo(() => {
    const fromTs = from ? new Date(from).getTime() : undefined;
    const toTs = to ? new Date(to).getTime() : undefined;
    const filter: Record<string, unknown> = {};
    if (fromTs !== undefined) filter.from = fromTs;
    if (toTs !== undefined) filter.to = toTs;
    if (modelFilter)
      filter.modelIds = modelFilter.split(",").map((s) => s.trim());

    const entries = usageStorage.list(
      filter as Parameters<typeof usageStorage.list>[0],
    );
    return entries.slice(0, 500);
  }, [from, to, modelFilter]);

  const totalSpend = useMemo(
    () => list.reduce((sum, e) => sum + e.totalCost, 0),
    [list],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <List className="h-6 w-6" /> Usage & Costs
      </h1>

      {/* Filters */}
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-300">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">From</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="flex-1 bg-white/5 border-none rounded-lg px-3 py-2 text-sm text-white focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-colors"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">To</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="flex-1 bg-white/5 border-none rounded-lg px-3 py-2 text-sm text-white focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-colors"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-400 mb-1">
              Model IDs (comma-separated)
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="modelA, modelB"
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="flex-1 bg-white/5 border-none rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 transition-colors"
              />
            </div>
          </label>
        </div>
      </div>

      {/* Total */}
      <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)] flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          <DollarSign className="h-5 w-5 text-green-400" />
          <span className="text-sm">Total Spend</span>
        </div>
        <div className="text-lg font-semibold text-green-400">
          {formatCurrency(totalSpend)}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#151A21] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.35)] divide-y divide-white/6">
        {list.length === 0 && (
          <div className="p-6 text-sm text-gray-400">
            No usage yet. Generate prompts to see entries here.
          </div>
        )}
        {list.map((e: UsageEntry) => (
          <div
            key={e.id}
            className="p-4 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {e.imagePreview ? (
                <a
                  href={e.imagePreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-16 h-16 rounded border border-gray-300 dark:border-gray-600 overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  title="Click to view full image"
                >
                  <Image
                    src={e.imagePreview}
                    alt="Prompt image"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </a>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg border border-white/10 flex items-center justify-center bg-white/5">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div
                  className="text-sm font-medium text-white truncate"
                  title={e.modelName}
                >
                  {middleEllipsis(e.modelName, 40)}{" "}
                  <span className="text-xs text-gray-500">({e.modelId})</span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(e.timestamp).toLocaleString()}
                </div>
                <div className="mt-1 text-xs text-gray-300">
                  Input: {e.inputTokens} • Output: {e.outputTokens}
                </div>
                {!e.success && e.error && (
                  <div className="mt-1 text-xs text-red-400">
                    Error: {e.error}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div
                className={`text-sm font-semibold ${e.success ? "text-green-400" : "text-gray-400"}`}
              >
                {formatCurrency(e.totalCost)}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(e.inputCost)} + {formatCurrency(e.outputCost)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageTab;
