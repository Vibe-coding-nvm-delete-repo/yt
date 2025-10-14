"use client";

import React, { useMemo, useState } from "react";
import { usageStorage } from "@/lib/usage";
import type { UsageEntry } from "@/types/usage";
import { Calendar, DollarSign, Filter, List, SlidersHorizontal } from "lucide-react";

interface UsageTabProps {}

const formatCurrency = (n: number) => `$${n.toFixed(6)}`;

export const UsageTab: React.FC<UsageTabProps> = () => {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [modelFilter, setModelFilter] = useState<string>("");

  const list = useMemo(() => {
    const fromTs = from ? new Date(from).getTime() : undefined;
    const toTs = to ? new Date(to).getTime() : undefined;
    const filter: Record<string, unknown> = {};
    if (fromTs !== undefined) filter.from = fromTs;
    if (toTs !== undefined) filter.to = toTs;
    if (modelFilter) filter.modelIds = modelFilter.split(",").map((s) => s.trim());

    const entries = usageStorage.list(filter as any);
    return entries.slice(0, 500);
  }, [from, to, modelFilter]);

  const totalSpend = useMemo(() => list.reduce((sum, e) => sum + e.totalCost, 0), [list]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <List className="h-6 w-6" /> Usage & Costs
      </h1>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3 text-sm text-gray-700 dark:text-gray-300">
          <Filter className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">From</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm" />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To</span>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm" />
            </div>
          </label>
          <label className="block">
            <span className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Model IDs (comma-separated)</span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <input type="text" placeholder="modelA, modelB" value={modelFilter} onChange={(e) => setModelFilter(e.target.value)} className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm" />
            </div>
          </label>
        </div>
      </div>

      {/* Total */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-sm">Total Spend</span>
        </div>
        <div className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalSpend)}</div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
        {list.length === 0 && (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">No usage yet. Generate prompts to see entries here.</div>
        )}
        {list.map((e: UsageEntry) => (
          <div key={e.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.modelName} <span className="text-xs text-gray-500">({e.modelId})</span></div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(e.timestamp).toLocaleString()}</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Input: {e.inputTokens} • Output: {e.outputTokens}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(e.totalCost)}</div>
              <div className="text-xs text-gray-500">{formatCurrency(e.inputCost)} + {formatCurrency(e.outputCost)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageTab;
