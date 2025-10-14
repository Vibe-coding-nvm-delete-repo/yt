"use client";

import React, { useMemo, useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { HistoryEntry } from "@/types/history";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";

type SortField = keyof HistoryEntry;
type SortOrder = "asc" | "desc";

// SortIndicator component defined outside to avoid recreation during render
const SortIndicator: React.FC<{
  field: SortField;
  sortField: SortField;
  sortOrder: SortOrder;
}> = ({ field, sortField, sortOrder }) => {
  if (sortField !== field) return null;
  return (
    <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
  );
};

export const HistoryTab: React.FC = () => {
  const { entries } = useHistory();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const itemsPerPage = 20;

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = [...entries];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.prompt.toLowerCase().includes(query) ||
          entry.modelName.toLowerCase().includes(query),
      );
    }

    // Date range filter
    if (dateFrom) {
      const fromTime = new Date(dateFrom).getTime();
      result = result.filter((entry) => entry.createdAt >= fromTime);
    }
    if (dateTo) {
      const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
      result = result.filter((entry) => entry.createdAt <= toTime);
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (sortOrder === "asc") {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
      }
    });

    return result;
  }, [entries, searchQuery, dateFrom, dateTo, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / itemsPerPage),
  );
  const paginatedEntries = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFrom, dateTo, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatCost = (cost: number) => {
    // Show user-friendly format: 2 decimal places for amounts >= $0.01
    // Otherwise show up to 6 decimals for very small amounts
    if (cost >= 0.01) {
      return `$${cost.toFixed(2)}`;
    }
    return `$${cost.toFixed(6)}`;
  };
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Generation History
        </h2>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              placeholder="From"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("createdAt")}
                >
                  Date/Time
                  <SortIndicator
                    field="createdAt"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("modelName")}
                >
                  Model
                  <SortIndicator
                    field="modelName"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Image
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Prompt
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("inputTokens")}
                >
                  Input Tokens
                  <SortIndicator
                    field="inputTokens"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("outputTokens")}
                >
                  Output Tokens
                  <SortIndicator
                    field="outputTokens"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("inputCost")}
                >
                  Input Cost
                  <SortIndicator
                    field="inputCost"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("outputCost")}
                >
                  Output Cost
                  <SortIndicator
                    field="outputCost"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={() => handleSort("totalCost")}
                >
                  Total Cost
                  <SortIndicator
                    field="totalCost"
                    sortField={sortField}
                    sortOrder={sortOrder}
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No history entries found.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white whitespace-nowrap">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white">
                      {entry.modelName}
                    </td>
                    <td className="px-3 py-2">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={entry.imageUrl}
                          alt="Input"
                          fill
                          className="object-cover rounded"
                          unoptimized
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white max-w-xs truncate">
                      {entry.prompt}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white text-right">
                      {entry.inputTokens.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white text-right">
                      {entry.outputTokens.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white text-right">
                      {formatCost(entry.inputCost)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white text-right">
                      {formatCost(entry.outputCost)}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-white text-right font-semibold">
                      {formatCost(entry.totalCost)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredAndSorted.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} of{" "}
            {filteredAndSorted.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Generation Details
              </h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Date/Time:
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(selectedEntry.createdAt)}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Model:
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedEntry.modelName}
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Input Image:
                </label>
                <div className="relative w-full max-w-md h-64">
                  <Image
                    src={selectedEntry.imageUrl}
                    alt="Input"
                    fill
                    className="object-contain rounded"
                    unoptimized
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Generated Prompt:
                </label>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                  {selectedEntry.prompt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Input Tokens:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEntry.inputTokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Output Tokens:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEntry.outputTokens.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Input Cost:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCost(selectedEntry.inputCost)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Output Cost:
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCost(selectedEntry.outputCost)}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Total Cost:
                  </label>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCost(selectedEntry.totalCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;
