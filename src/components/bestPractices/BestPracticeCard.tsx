"use client";

import React from "react";
import { Edit, Trash2, Calendar } from "lucide-react";
import type { BestPractice } from "@/types";

interface BestPracticeCardProps {
  practice: BestPractice;
  onEdit: (practice: BestPractice) => void;
  onDelete: (id: string) => void;
}

export const BestPracticeCard: React.FC<BestPracticeCardProps> = ({
  practice,
  onEdit,
  onDelete,
}) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {practice.name}
            </h3>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                practice.type === "mandatory"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : practice.type === "optional"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
              }`}
            >
              {practice.type}
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              Importance: {practice.importance}/10
            </span>
            <span className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(practice.createdAt)}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {practice.description}
          </p>

          {practice.leonardoAiLanguage && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Leonardo.AI Language:{" "}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {practice.leonardoAiLanguage}
              </span>
            </div>
          )}

          {practice.typeExplanation && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Type Explanation:{" "}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {practice.typeExplanation}
              </span>
            </div>
          )}

          {practice.images.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Images ({practice.images.length}):
              </span>
              <div className="flex gap-2 flex-wrap">
                {practice.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Example ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded border border-gray-300 dark:border-gray-600"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(practice)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded transition-colors"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(practice.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
