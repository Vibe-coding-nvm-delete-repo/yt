"use client";

/* eslint-disable @next/next/no-img-element -- Static reference cards require direct <img> usage for current asset pipeline. */
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
    <div className="bg-[#151A21] rounded-xl p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-white">
              {practice.name}
            </h3>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                practice.type === "mandatory"
                  ? "bg-red-900/30 text-red-400"
                  : practice.type === "optional"
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-yellow-900/30 text-yellow-400"
              }`}
            >
              {practice.type}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-white/10 text-gray-300">
              Importance: {practice.importance}/10
            </span>
            <span className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(practice.createdAt)}
            </span>
          </div>

          <p className="text-gray-300 mb-2">{practice.description}</p>

          {practice.leonardoAiLanguage && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-300">
                Leonardo.AI Language:{" "}
              </span>
              <span className="text-sm text-gray-400">
                {practice.leonardoAiLanguage}
              </span>
            </div>
          )}

          {practice.typeExplanation && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-300">
                Type Explanation:{" "}
              </span>
              <span className="text-sm text-gray-400">
                {practice.typeExplanation}
              </span>
            </div>
          )}

          {practice.images.length > 0 && (
            <div className="mt-3">
              <span className="text-sm font-medium text-gray-300 block mb-2">
                Images ({practice.images.length}):
              </span>
              <div className="flex gap-2 flex-wrap">
                {practice.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Example ${idx + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border border-white/10"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(practice)}
            className="p-2 text-blue-400 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(practice.id)}
            className="p-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
